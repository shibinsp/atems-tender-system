from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderStatus
from app.models.bid import Bid

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])


class DashboardStats(BaseModel):
    total_tenders: int
    active_tenders: int
    total_bids: int
    total_savings: float
    avg_cycle_days: int
    pending_approvals: int


class TenderTrend(BaseModel):
    month: str
    count: int
    value: float


class CategoryStats(BaseModel):
    category: str
    tender_count: int
    total_value: float


class VendorStats(BaseModel):
    vendor_id: int
    company_name: str
    total_bids: int
    won_bids: int
    win_rate: float


@router.get("/executive-dashboard")
async def get_executive_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Executive dashboard with KPIs"""
    # Total tenders
    total_tenders = db.query(Tender).count()
    active_tenders = db.query(Tender).filter(Tender.status == TenderStatus.PUBLISHED).count()
    
    # Total bids
    total_bids = db.query(Bid).count()
    
    # Savings calculation
    from app.models.contract import Contract
    contracts = db.query(Contract).all()
    total_estimated = sum(float(c.tender.estimated_value or 0) for c in contracts if c.tender)
    total_awarded = sum(float(c.contract_value or 0) for c in contracts)
    total_savings = total_estimated - total_awarded
    
    # Status distribution
    status_dist = db.query(
        Tender.status, func.count(Tender.id)
    ).group_by(Tender.status).all()
    
    # Monthly trend (last 6 months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    monthly_tenders = db.query(
        func.to_char(Tender.created_at, 'YYYY-MM').label('month'),
        func.count(Tender.id).label('count')
    ).filter(Tender.created_at >= six_months_ago).group_by('month').order_by('month').all()
    
    return {
        "kpis": {
            "total_tenders": total_tenders,
            "active_tenders": active_tenders,
            "total_bids": total_bids,
            "total_savings": total_savings,
            "savings_percentage": round((total_savings / total_estimated * 100) if total_estimated > 0 else 0, 2)
        },
        "status_distribution": [{"status": s.value, "count": c} for s, c in status_dist],
        "monthly_trend": [{"month": m, "count": c} for m, c in monthly_tenders],
        "recent_activity": await get_recent_activity(db)
    }


@router.get("/tender-cycle-analysis")
async def get_tender_cycle_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze tender cycle times"""
    tenders = db.query(Tender).filter(Tender.status == TenderStatus.AWARDED).limit(100).all()
    
    cycle_times = []
    for t in tenders:
        if t.created_at and t.publishing_date:
            draft_days = (t.publishing_date - t.created_at).days
        else:
            draft_days = 0
        cycle_times.append({
            "tender_id": t.tender_id,
            "draft_to_publish_days": draft_days,
            "total_days": (datetime.utcnow() - t.created_at).days if t.created_at else 0
        })
    
    avg_cycle = sum(c['total_days'] for c in cycle_times) / len(cycle_times) if cycle_times else 0
    
    return {
        "average_cycle_days": round(avg_cycle),
        "tenders_analyzed": len(cycle_times),
        "details": cycle_times[:20]
    }


@router.get("/vendor-participation")
async def get_vendor_participation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Vendor participation analytics"""
    from app.models.bid import Bidder, BidStatus
    
    # Top bidders
    top_bidders = db.query(
        Bidder.id,
        Bidder.company_name,
        func.count(Bid.id).label('total_bids'),
        func.sum(case((Bid.status == BidStatus.AWARDED, 1), else_=0)).label('won_bids')
    ).join(Bid).group_by(Bidder.id).order_by(func.count(Bid.id).desc()).limit(10).all()
    
    return {
        "top_bidders": [
            {
                "vendor_id": b.id,
                "company_name": b.company_name,
                "total_bids": b.total_bids,
                "won_bids": b.won_bids or 0,
                "win_rate": round((b.won_bids or 0) / b.total_bids * 100, 1) if b.total_bids > 0 else 0
            }
            for b in top_bidders
        ]
    }


@router.get("/category-spend")
async def get_category_spend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Category-wise spend analysis"""
    from app.models.user import Category
    
    category_stats = db.query(
        Category.name,
        func.count(Tender.id).label('tender_count'),
        func.sum(Tender.estimated_value).label('total_value')
    ).join(Tender, Tender.category_id == Category.id).group_by(Category.id).all()
    
    return {
        "categories": [
            {
                "category": c.name,
                "tender_count": c.tender_count,
                "total_value": float(c.total_value or 0)
            }
            for c in category_stats
        ]
    }


@router.get("/department-performance")
async def get_department_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Department-wise performance"""
    from app.models.user import Department
    
    dept_stats = db.query(
        Department.name,
        func.count(Tender.id).label('total_tenders'),
        func.sum(case((Tender.status == TenderStatus.AWARDED, 1), else_=0)).label('awarded'),
        func.sum(Tender.estimated_value).label('total_value')
    ).join(Tender, Tender.department_id == Department.id).group_by(Department.id).all()
    
    return {
        "departments": [
            {
                "department": d.name,
                "total_tenders": d.total_tenders,
                "awarded": d.awarded or 0,
                "completion_rate": round((d.awarded or 0) / d.total_tenders * 100, 1) if d.total_tenders > 0 else 0,
                "total_value": float(d.total_value or 0)
            }
            for d in dept_stats
        ]
    }


@router.get("/savings-report")
async def get_savings_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detailed savings report"""
    from app.models.contract import Contract
    
    contracts = db.query(Contract).join(Tender).filter(
        Contract.contract_value.isnot(None)
    ).all()
    
    savings_data = []
    total_estimated = 0
    total_awarded = 0
    
    for c in contracts:
        estimated = float(c.tender.estimated_value or 0) if c.tender else 0
        awarded = float(c.contract_value or 0)
        savings = estimated - awarded
        
        total_estimated += estimated
        total_awarded += awarded
        
        savings_data.append({
            "contract_number": c.contract_number,
            "tender_title": c.title,
            "estimated_value": estimated,
            "awarded_value": awarded,
            "savings": savings,
            "savings_percent": round(savings / estimated * 100, 1) if estimated > 0 else 0
        })
    
    return {
        "summary": {
            "total_estimated": total_estimated,
            "total_awarded": total_awarded,
            "total_savings": total_estimated - total_awarded,
            "overall_savings_percent": round((total_estimated - total_awarded) / total_estimated * 100, 1) if total_estimated > 0 else 0
        },
        "contracts": savings_data
    }


async def get_recent_activity(db: Session, limit: int = 10):
    """Get recent system activity"""
    from app.models.audit import AuditLog
    
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    return [
        {
            "action": log.action,
            "entity_type": log.entity_type,
            "user": log.user.full_name if log.user else "System",
            "timestamp": log.created_at.isoformat() if log.created_at else None
        }
        for log in logs
    ]


@router.get("/calendar-events")
async def get_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tender events for calendar view"""
    query = db.query(Tender)
    
    if start_date:
        query = query.filter(Tender.submission_deadline >= start_date)
    if end_date:
        query = query.filter(Tender.submission_deadline <= end_date)
    
    tenders = query.all()
    
    events = []
    for t in tenders:
        if t.publishing_date:
            events.append({
                "id": f"pub-{t.id}",
                "title": f"📢 Publish: {t.title[:30]}",
                "date": t.publishing_date.strftime('%Y-%m-%d'),
                "type": "publish",
                "tender_id": t.id
            })
        if t.submission_deadline:
            events.append({
                "id": f"dead-{t.id}",
                "title": f"⏰ Deadline: {t.title[:30]}",
                "date": t.submission_deadline.strftime('%Y-%m-%d'),
                "type": "deadline",
                "tender_id": t.id
            })
        if t.technical_opening_date:
            events.append({
                "id": f"open-{t.id}",
                "title": f"📂 Opening: {t.title[:30]}",
                "date": t.technical_opening_date.strftime('%Y-%m-%d'),
                "type": "opening",
                "tender_id": t.id
            })
    
    return {"events": events}

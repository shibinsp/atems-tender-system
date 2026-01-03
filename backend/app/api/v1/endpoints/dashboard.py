from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from app.core.dependencies import get_db, get_current_user
from app.models.user import User, UserRole, Department
from app.models.tender import Tender, TenderStatus, TenderType
from app.models.bid import Bid, BidStatus
from app.models.audit import AuditLog

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get dashboard statistics"""
    # Active tenders
    active_tenders = db.query(Tender).filter(
        Tender.status == TenderStatus.PUBLISHED
    ).count()

    # Pending evaluations
    pending_evaluations = db.query(Tender).filter(
        Tender.status == TenderStatus.UNDER_EVALUATION
    ).count()

    # Total bids
    total_bids = db.query(Bid).filter(
        Bid.status == BidStatus.SUBMITTED
    ).count()

    # Upcoming deadlines (next 7 days)
    now = utc_now()
    next_week = now + timedelta(days=7)
    upcoming_deadlines = db.query(Tender).filter(
        Tender.submission_deadline <= next_week,
        Tender.submission_deadline >= now,
        Tender.status == TenderStatus.PUBLISHED
    ).count()

    # Role-specific stats
    if current_user.role == UserRole.BIDDER:
        my_bids = db.query(Bid).join(Bid.bidder).filter(
            Bid.bidder.has(user_id=current_user.id)
        ).count()
        return {
            "active_tenders": active_tenders,
            "my_bids": my_bids,
            "upcoming_deadlines": upcoming_deadlines
        }

    return {
        "active_tenders": active_tenders,
        "pending_evaluations": pending_evaluations,
        "total_bids": total_bids,
        "upcoming_deadlines": upcoming_deadlines
    }


@router.get("/chart-data")
async def get_chart_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get data for dashboard charts"""
    # Tender status distribution
    status_distribution = db.query(
        Tender.status, func.count(Tender.id)
    ).group_by(Tender.status).all()

    status_data = [
        {"status": status.value if status else "Unknown", "count": count}
        for status, count in status_distribution
    ]

    # Monthly tender count (last 6 months)
    six_months_ago = utc_now() - timedelta(days=180)
    monthly_tenders = db.query(
        func.strftime('%Y-%m', Tender.created_at).label('month'),
        func.count(Tender.id)
    ).filter(
        Tender.created_at >= six_months_ago
    ).group_by('month').order_by('month').all()

    monthly_data = [
        {"month": month, "count": count}
        for month, count in monthly_tenders
    ]

    # Tender type distribution
    type_distribution = db.query(
        Tender.tender_type, func.count(Tender.id)
    ).group_by(Tender.tender_type).all()

    type_data = [
        {"type": ttype.value if ttype else "Unknown", "count": count}
        for ttype, count in type_distribution
    ]

    return {
        "status_distribution": status_data,
        "monthly_tenders": monthly_data,
        "type_distribution": type_data
    }


@router.get("/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive analytics data"""
    now = utc_now()

    # Total counts
    total_tenders = db.query(Tender).count()
    total_bids = db.query(Bid).count()
    awarded_tenders = db.query(Tender).filter(Tender.status == TenderStatus.AWARDED).count()

    # Calculate savings (estimated value vs awarded value)
    awarded_with_bids = db.query(Tender, Bid).join(Bid).filter(
        Tender.status == TenderStatus.AWARDED,
        Bid.rank == 1
    ).all()

    total_estimated = sum(float(t.estimated_value or 0) for t, b in awarded_with_bids)
    total_awarded = sum(float(b.financial_amount or 0) for t, b in awarded_with_bids)
    total_savings = total_estimated - total_awarded
    savings_percentage = (total_savings / total_estimated * 100) if total_estimated > 0 else 0

    # Average bids per tender
    avg_bids = db.query(func.avg(
        db.query(func.count(Bid.id)).filter(Bid.tender_id == Tender.id).correlate(Tender).scalar_subquery()
    )).scalar() or 0

    # MSME participation
    msme_bids = db.query(Bid).join(Bid.bidder).filter(
        Bid.bidder.has(is_msme=True)
    ).count()
    msme_percentage = (msme_bids / total_bids * 100) if total_bids > 0 else 0

    return {
        "total_tenders": total_tenders,
        "total_bids": total_bids,
        "awarded_tenders": awarded_tenders,
        "total_estimated_value": total_estimated,
        "total_awarded_value": total_awarded,
        "total_savings": total_savings,
        "savings_percentage": round(savings_percentage, 2),
        "average_bids_per_tender": round(float(avg_bids), 1),
        "msme_participation": round(msme_percentage, 2)
    }


@router.get("/department-analysis")
async def get_department_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get department-wise tender analysis"""
    departments = db.query(Department).all()

    result = []
    for dept in departments:
        dept_tenders = db.query(Tender).filter(Tender.department_id == dept.id).all()
        total_value = sum(float(t.estimated_value or 0) for t in dept_tenders)
        awarded_count = sum(1 for t in dept_tenders if t.status == TenderStatus.AWARDED)

        result.append({
            "department_id": dept.id,
            "department_name": dept.name,
            "total_tenders": len(dept_tenders),
            "awarded_tenders": awarded_count,
            "total_value": total_value,
            "completion_rate": round(awarded_count / len(dept_tenders) * 100, 1) if dept_tenders else 0
        })

    return sorted(result, key=lambda x: x['total_tenders'], reverse=True)


@router.get("/evaluation-progress")
async def get_evaluation_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get evaluation progress statistics"""
    # Tenders by evaluation status
    under_evaluation = db.query(Tender).filter(
        Tender.status == TenderStatus.UNDER_EVALUATION
    ).count()

    evaluated = db.query(Tender).filter(
        Tender.status == TenderStatus.EVALUATED
    ).count()

    # Bids by qualification status
    qualified_bids = db.query(Bid).filter(Bid.is_qualified == True).count()
    disqualified_bids = db.query(Bid).filter(Bid.is_qualified == False).count()
    pending_bids = db.query(Bid).filter(
        Bid.is_qualified == None,
        Bid.status == BidStatus.SUBMITTED
    ).count()

    return {
        "tenders_under_evaluation": under_evaluation,
        "tenders_evaluated": evaluated,
        "qualified_bids": qualified_bids,
        "disqualified_bids": disqualified_bids,
        "pending_evaluation_bids": pending_bids
    }


@router.get("/calendar")
async def get_calendar_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get calendar events for tender deadlines"""
    now = utc_now()

    # Default to next 30 days if no dates provided
    if not start_date:
        start = now
    else:
        start = datetime.fromisoformat(start_date)

    if not end_date:
        end = now + timedelta(days=30)
    else:
        end = datetime.fromisoformat(end_date)

    # Get tenders with deadlines in range
    tenders = db.query(Tender).filter(
        Tender.submission_deadline >= start,
        Tender.submission_deadline <= end
    ).all()

    events = []
    for tender in tenders:
        # Submission deadline event
        if tender.submission_deadline:
            events.append({
                "id": f"deadline-{tender.id}",
                "title": f"Deadline: {tender.title[:30]}...",
                "date": tender.submission_deadline.isoformat(),
                "type": "deadline",
                "tender_id": tender.id,
                "status": tender.status.value if tender.status else "Unknown"
            })

        # Bid opening event
        if tender.technical_opening_date:
            events.append({
                "id": f"opening-{tender.id}",
                "title": f"Technical Opening: {tender.title[:25]}...",
                "date": tender.technical_opening_date.isoformat(),
                "type": "opening",
                "tender_id": tender.id
            })

    return sorted(events, key=lambda x: x['date'])


@router.get("/trends")
async def get_trends(
    period: str = Query("6m", pattern="^(1m|3m|6m|1y)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get trend data for charts"""
    now = utc_now()

    # Determine date range
    period_days = {"1m": 30, "3m": 90, "6m": 180, "1y": 365}
    start_date = now - timedelta(days=period_days.get(period, 180))

    # Tender creation trend
    tender_trend = db.query(
        func.strftime('%Y-%m-%d', Tender.created_at).label('date'),
        func.count(Tender.id).label('count')
    ).filter(
        Tender.created_at >= start_date
    ).group_by('date').order_by('date').all()

    # Bid submission trend
    bid_trend = db.query(
        func.strftime('%Y-%m-%d', Bid.submission_date).label('date'),
        func.count(Bid.id).label('count')
    ).filter(
        Bid.submission_date >= start_date,
        Bid.submission_date != None
    ).group_by('date').order_by('date').all()

    return {
        "period": period,
        "tender_trend": [{"date": d, "count": c} for d, c in tender_trend],
        "bid_trend": [{"date": d, "count": c} for d, c in bid_trend if d]
    }


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get recent system activities"""
    activities = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).limit(limit).all()

    return [
        {
            "id": activity.id,
            "action": activity.action,
            "entity_type": activity.entity_type,
            "entity_id": activity.entity_id,
            "user_id": activity.user_id,
            "created_at": activity.created_at.isoformat() if activity.created_at else None
        }
        for activity in activities
    ]


@router.get("/upcoming-deadlines")
async def get_upcoming_deadlines(
    days: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get upcoming tender deadlines"""
    now = utc_now()
    deadline = now + timedelta(days=days)

    tenders = db.query(Tender).filter(
        Tender.submission_deadline <= deadline,
        Tender.submission_deadline >= now,
        Tender.status == TenderStatus.PUBLISHED
    ).order_by(Tender.submission_deadline).all()

    return [
        {
            "id": tender.id,
            "tender_id": tender.tender_id,
            "title": tender.title,
            "category": tender.category.name if tender.category else None,
            "estimated_value": float(tender.estimated_value) if tender.estimated_value else None,
            "submission_deadline": tender.submission_deadline.isoformat() if tender.submission_deadline else None,
            "days_remaining": (tender.submission_deadline.replace(tzinfo=None) - now.replace(tzinfo=None)).days if tender.submission_deadline else None,
            "bids_count": len(tender.bids) if tender.bids else 0
        }
        for tender in tenders
    ]

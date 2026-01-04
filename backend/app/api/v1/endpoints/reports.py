from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from app.core.dependencies import get_db, get_current_user
from app.models.user import User, Department, Category
from app.models.tender import Tender, TenderStatus, TenderType
from app.models.bid import Bid, BidStatus, Bidder
from app.models.evaluation import Evaluation
from app.models.audit import AuditLog

router = APIRouter(prefix="/reports", tags=["Reports"])


def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)


@router.get("/tender-status")
async def get_tender_status_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get tender status report with filters"""
    query = db.query(Tender)

    # Apply filters
    if start_date:
        query = query.filter(Tender.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Tender.created_at <= datetime.fromisoformat(end_date))
    if department_id:
        query = query.filter(Tender.department_id == department_id)
    if category_id:
        query = query.filter(Tender.category_id == category_id)

    tenders = query.all()
    total_tenders = len(tenders)

    # Status distribution
    status_counts = {}
    for tender in tenders:
        status = tender.status.value if tender.status else "Unknown"
        status_counts[status] = status_counts.get(status, 0) + 1

    by_status = [
        {
            "status": status,
            "count": count,
            "percentage": round(count / total_tenders * 100, 1) if total_tenders > 0 else 0
        }
        for status, count in status_counts.items()
    ]

    # Type distribution
    type_counts = {}
    for tender in tenders:
        ttype = tender.tender_type.value if tender.tender_type else "Unknown"
        type_counts[ttype] = type_counts.get(ttype, 0) + 1

    by_type = [{"type": t, "count": c} for t, c in type_counts.items()]

    # Department distribution
    dept_data = {}
    for tender in tenders:
        dept_name = tender.department.name if tender.department else "Unknown"
        if dept_name not in dept_data:
            dept_data[dept_name] = {"count": 0, "value": 0}
        dept_data[dept_name]["count"] += 1
        dept_data[dept_name]["value"] += float(tender.estimated_value or 0)

    by_department = [
        {"department": dept, "count": data["count"], "value": data["value"]}
        for dept, data in dept_data.items()
    ]

    # Monthly timeline (last 6 months)
    six_months_ago = utc_now() - timedelta(days=180)
    monthly_data = {}
    for tender in tenders:
        if tender.created_at and tender.created_at >= six_months_ago.replace(tzinfo=None):
            month_key = tender.created_at.strftime('%b %Y')
            if month_key not in monthly_data:
                monthly_data[month_key] = {"created": 0, "awarded": 0}
            monthly_data[month_key]["created"] += 1
            if tender.status == TenderStatus.AWARDED:
                monthly_data[month_key]["awarded"] += 1

    timeline = [
        {"month": month, "created": data["created"], "awarded": data["awarded"]}
        for month, data in monthly_data.items()
    ]

    # Average cycle time (use updated_at as proxy for award date)
    awarded_tenders = [t for t in tenders if t.status == TenderStatus.AWARDED and t.created_at and t.updated_at]
    if awarded_tenders:
        total_days = sum((t.updated_at - t.created_at).days for t in awarded_tenders)
        avg_cycle_time = total_days / len(awarded_tenders)
    else:
        avg_cycle_time = 0

    return {
        "total_tenders": total_tenders,
        "by_status": by_status,
        "by_type": by_type,
        "by_department": by_department,
        "timeline": timeline,
        "avg_cycle_time_days": round(avg_cycle_time, 1)
    }


@router.get("/bid-summary")
async def get_bid_summary_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get bid summary report"""
    query = db.query(Bid)

    if start_date:
        query = query.filter(Bid.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Bid.created_at <= datetime.fromisoformat(end_date))
    if department_id:
        query = query.join(Tender).filter(Tender.department_id == department_id)

    bids = query.all()
    total_bids = len(bids)
    total_value = sum(float(b.financial_amount or 0) for b in bids)

    # Status distribution
    status_counts = {}
    for bid in bids:
        status = bid.status.value if bid.status else "Unknown"
        status_counts[status] = status_counts.get(status, 0) + 1

    by_status = [{"status": s, "count": c} for s, c in status_counts.items()]

    # Top tenders by bid count
    tender_bids = {}
    for bid in bids:
        if bid.tender:
            key = (bid.tender.tender_id, bid.tender.title)
            tender_bids[key] = tender_bids.get(key, 0) + 1

    by_tender = [
        {"tender_id": tid, "title": title[:50], "bid_count": count}
        for (tid, title), count in sorted(tender_bids.items(), key=lambda x: -x[1])[:10]
    ]

    # Average bids per tender
    unique_tenders = len(set(b.tender_id for b in bids if b.tender_id))
    avg_bids = total_bids / unique_tenders if unique_tenders > 0 else 0

    # MSME participation
    msme_count = 0
    non_msme_count = 0
    for bid in bids:
        if bid.bidder and bid.bidder.is_msme:
            msme_count += 1
        else:
            non_msme_count += 1

    # Qualification rate
    qualified = sum(1 for b in bids if b.is_qualified == True)
    total_evaluated = sum(1 for b in bids if b.is_qualified is not None)
    qualification_rate = (qualified / total_evaluated * 100) if total_evaluated > 0 else 0

    return {
        "total_bids": total_bids,
        "total_value": total_value,
        "by_status": by_status,
        "by_tender": by_tender,
        "avg_bids_per_tender": round(avg_bids, 1),
        "msme_participation": {"msme": msme_count, "non_msme": non_msme_count},
        "qualification_rate": round(qualification_rate, 1)
    }


@router.get("/evaluation-summary")
async def get_evaluation_summary_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get evaluation summary report"""
    # Get tenders with evaluations
    query = db.query(Tender)

    if start_date:
        query = query.filter(Tender.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Tender.created_at <= datetime.fromisoformat(end_date))
    if department_id:
        query = query.filter(Tender.department_id == department_id)

    tenders = query.all()

    # Count evaluations
    total_evaluations = 0
    completed_evaluations = 0
    pending_evaluations = 0

    for tender in tenders:
        if tender.status in [TenderStatus.UNDER_EVALUATION, TenderStatus.EVALUATED, TenderStatus.AWARDED]:
            total_evaluations += 1
            if tender.status in [TenderStatus.EVALUATED, TenderStatus.AWARDED]:
                completed_evaluations += 1
            else:
                pending_evaluations += 1

    # Evaluation method distribution
    method_counts = {}
    for tender in tenders:
        if tender.evaluation_type:
            method = tender.evaluation_type.value if hasattr(tender.evaluation_type, 'value') else str(tender.evaluation_type)
            method_counts[method] = method_counts.get(method, 0) + 1

    by_method = [{"method": m, "count": c} for m, c in method_counts.items()]

    # Get all bids with scores
    bids = db.query(Bid).filter(Bid.technical_score.isnot(None)).all()
    scores = [float(b.technical_score) for b in bids if b.technical_score]
    avg_technical_score = sum(scores) / len(scores) if scores else 0

    # Score distribution
    score_ranges = {"0-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for score in scores:
        if score <= 40:
            score_ranges["0-40"] += 1
        elif score <= 60:
            score_ranges["41-60"] += 1
        elif score <= 80:
            score_ranges["61-80"] += 1
        else:
            score_ranges["81-100"] += 1

    score_distribution = [{"range": r, "count": c} for r, c in score_ranges.items()]

    # Average evaluation time (mock for now, would need evaluation timestamps)
    avg_evaluation_time = 12

    return {
        "total_evaluations": total_evaluations,
        "completed_evaluations": completed_evaluations,
        "pending_evaluations": pending_evaluations,
        "by_method": by_method,
        "avg_technical_score": round(avg_technical_score, 1),
        "avg_evaluation_time_days": avg_evaluation_time,
        "score_distribution": score_distribution
    }


@router.get("/department-analysis")
async def get_department_analysis_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get department-wise analysis report"""
    departments = db.query(Department).all()

    dept_results = []
    for dept in departments:
        query = db.query(Tender).filter(Tender.department_id == dept.id)

        if start_date:
            query = query.filter(Tender.created_at >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(Tender.created_at <= datetime.fromisoformat(end_date))

        tenders = query.all()

        if not tenders:
            continue

        total_estimated = sum(float(t.estimated_value or 0) for t in tenders)

        # Get awarded bids for this department
        awarded_value = 0
        awarded_count = 0
        total_days = 0

        for tender in tenders:
            if tender.status == TenderStatus.AWARDED:
                awarded_count += 1
                # Get winning bid
                winning_bid = db.query(Bid).filter(
                    Bid.tender_id == tender.id,
                    Bid.rank == 1
                ).first()
                if winning_bid:
                    awarded_value += float(winning_bid.financial_amount or 0)
                if tender.created_at and tender.updated_at:
                    total_days += (tender.updated_at - tender.created_at).days

        savings = total_estimated - awarded_value
        savings_pct = (savings / total_estimated * 100) if total_estimated > 0 else 0
        avg_cycle = total_days / awarded_count if awarded_count > 0 else 0

        dept_results.append({
            "id": dept.id,
            "name": dept.name,
            "tender_count": len(tenders),
            "total_estimated_value": total_estimated,
            "total_awarded_value": awarded_value,
            "savings": savings,
            "savings_percentage": round(savings_pct, 1),
            "avg_cycle_time": round(avg_cycle, 0)
        })

    # Top categories
    categories = db.query(Category).all()
    cat_data = []
    for cat in categories:
        tenders = db.query(Tender).filter(Tender.category_id == cat.id).all()
        if tenders:
            total_value = sum(float(t.estimated_value or 0) for t in tenders)
            cat_data.append({
                "category": cat.name,
                "count": len(tenders),
                "value": total_value
            })

    top_categories = sorted(cat_data, key=lambda x: -x["value"])[:5]

    return {
        "departments": sorted(dept_results, key=lambda x: -x["tender_count"]),
        "top_categories": top_categories
    }


@router.get("/savings")
async def get_savings_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get savings report"""
    query = db.query(Tender).filter(Tender.status == TenderStatus.AWARDED)

    if start_date:
        query = query.filter(Tender.updated_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Tender.updated_at <= datetime.fromisoformat(end_date))
    if department_id:
        query = query.filter(Tender.department_id == department_id)

    tenders = query.all()

    total_estimated = 0
    total_awarded = 0

    by_department = {}
    by_category = {}
    by_month = {}

    for tender in tenders:
        estimated = float(tender.estimated_value or 0)

        # Get winning bid amount
        winning_bid = db.query(Bid).filter(
            Bid.tender_id == tender.id,
            Bid.rank == 1
        ).first()
        awarded = float(winning_bid.financial_amount or 0) if winning_bid else 0

        total_estimated += estimated
        total_awarded += awarded

        # By department
        dept_name = tender.department.name if tender.department else "Unknown"
        if dept_name not in by_department:
            by_department[dept_name] = {"estimated": 0, "awarded": 0}
        by_department[dept_name]["estimated"] += estimated
        by_department[dept_name]["awarded"] += awarded

        # By category
        cat_name = tender.category.name if tender.category else "Unknown"
        if cat_name not in by_category:
            by_category[cat_name] = {"estimated": 0, "awarded": 0}
        by_category[cat_name]["estimated"] += estimated
        by_category[cat_name]["awarded"] += awarded

        # By month (use updated_at as proxy for award date)
        if tender.updated_at:
            month_key = tender.updated_at.strftime('%b %Y')
            if month_key not in by_month:
                by_month[month_key] = {"estimated": 0, "awarded": 0}
            by_month[month_key]["estimated"] += estimated
            by_month[month_key]["awarded"] += awarded

    total_savings = total_estimated - total_awarded
    savings_pct = (total_savings / total_estimated * 100) if total_estimated > 0 else 0

    return {
        "total_estimated_value": total_estimated,
        "total_awarded_value": total_awarded,
        "total_savings": total_savings,
        "savings_percentage": round(savings_pct, 1),
        "by_department": [
            {
                "department": dept,
                "estimated": data["estimated"],
                "awarded": data["awarded"],
                "savings": data["estimated"] - data["awarded"]
            }
            for dept, data in by_department.items()
        ],
        "by_category": [
            {
                "category": cat,
                "estimated": data["estimated"],
                "awarded": data["awarded"],
                "savings": data["estimated"] - data["awarded"]
            }
            for cat, data in by_category.items()
        ],
        "by_month": [
            {
                "month": month,
                "estimated": data["estimated"],
                "awarded": data["awarded"],
                "savings": data["estimated"] - data["awarded"]
            }
            for month, data in by_month.items()
        ]
    }


@router.get("/audit-trail")
async def get_audit_trail_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get audit trail report with pagination"""
    query = db.query(AuditLog)

    if start_date:
        query = query.filter(AuditLog.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(AuditLog.created_at <= datetime.fromisoformat(end_date))
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    total = query.count()

    entries = query.order_by(AuditLog.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    # Get user names
    user_ids = list(set(e.user_id for e in entries if e.user_id))
    users = {u.id: u.full_name for u in db.query(User).filter(User.id.in_(user_ids)).all()}

    return {
        "entries": [
            {
                "id": entry.id,
                "action": entry.action,
                "entity_type": entry.entity_type,
                "entity_id": entry.entity_id,
                "entity_name": f"{entry.entity_type}-{entry.entity_id}",
                "user_id": entry.user_id,
                "user_name": users.get(entry.user_id, "Unknown"),
                "details": {"old_values": entry.old_values, "new_values": entry.new_values} if entry.old_values or entry.new_values else None,
                "ip_address": entry.ip_address,
                "created_at": entry.created_at.isoformat() if entry.created_at else None
            }
            for entry in entries
        ],
        "total": total,
        "page": page,
        "pages": (total + page_size - 1) // page_size
    }

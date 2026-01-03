"""
Export Endpoints for ATEMS
Handles PDF, Excel, and CSV export requests
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.tender import Tender, EvaluationCriteria
from app.models.bid import Bid
from app.models.evaluation import Evaluation
from app.services.export_service import export_service

router = APIRouter(prefix="/exports", tags=["Exports"])


def require_staff(current_user: User):
    """Ensure user is staff (admin, tender officer, or evaluator)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TENDER_OFFICER, UserRole.EVALUATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to export data"
        )
    return current_user


@router.get("/tender/{tender_id}/summary/pdf")
async def export_tender_summary_pdf(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export tender summary as PDF"""
    require_staff(current_user)

    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Get bids for this tender
    bids = db.query(Bid).filter(Bid.tender_id == tender_id).all()

    tender_data = {
        'tender_id': tender.tender_id,
        'title': tender.title,
        'category': tender.category.name if tender.category else 'N/A',
        'estimated_value': float(tender.estimated_value or 0),
        'submission_deadline': tender.submission_deadline.strftime('%Y-%m-%d %H:%M') if tender.submission_deadline else 'N/A',
        'status': tender.status.value if tender.status else 'N/A'
    }

    bids_data = []
    for bid in bids:
        bids_data.append({
            'rank': bid.rank,
            'bidder_name': bid.bidder.company_name if bid.bidder else 'N/A',
            'financial_amount': float(bid.financial_amount or 0),
            'technical_score': float(bid.technical_score or 0),
            'status': bid.status.value if bid.status else 'N/A'
        })

    try:
        pdf_buffer = export_service.export_tender_summary_pdf(
            tender_data,
            bids_data,
            'L1'  # Default evaluation type
        )

        filename = f"tender_summary_{tender.tender_id}_{datetime.now().strftime('%Y%m%d')}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="PDF export not available. Please install reportlab."
        )


@router.get("/tender/{tender_id}/comparative-statement/pdf")
async def export_comparative_statement_pdf(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export comparative statement as PDF"""
    require_staff(current_user)

    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Get bids with evaluations
    bids = db.query(Bid).filter(
        Bid.tender_id == tender_id,
        Bid.status.notin_(['Draft', 'Withdrawn'])
    ).all()

    # Get evaluation criteria
    criteria = db.query(EvaluationCriteria).filter(
        EvaluationCriteria.tender_id == tender_id
    ).all()

    tender_data = {
        'tender_id': tender.tender_id,
        'title': tender.title,
        'estimated_value': float(tender.estimated_value or 0)
    }

    criteria_data = [{'id': c.id, 'name': c.criteria_name} for c in criteria]

    bids_data = []
    for bid in bids:
        bid_info = {
            'bidder_name': bid.bidder.company_name if bid.bidder else 'N/A',
            'financial_amount': float(bid.financial_amount or 0),
            'technical_score': float(bid.technical_score or 0),
            'financial_score': float(bid.financial_score or 0),
            'combined_score': float(bid.combined_score or 0),
            'rank': bid.rank,
            'criteria_scores': {}
        }

        # Get individual criteria scores
        for evaluation in bid.evaluations:
            bid_info['criteria_scores'][evaluation.criteria_id] = float(evaluation.score or 0)

        bids_data.append(bid_info)

    # Generate recommendation
    winner = min(bids_data, key=lambda x: x.get('rank', 999)) if bids_data else None
    if winner:
        recommendation = f"Based on the evaluation, it is recommended to award the contract to {winner['bidder_name']} with a combined score of {winner['combined_score']:.2f}."
    else:
        recommendation = "No valid bids received for evaluation."

    try:
        pdf_buffer = export_service.export_comparative_statement_pdf(
            tender_data,
            bids_data,
            criteria_data,
            recommendation
        )

        filename = f"comparative_statement_{tender.tender_id}_{datetime.now().strftime('%Y%m%d')}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="PDF export not available. Please install reportlab."
        )


@router.get("/tender/{tender_id}/bids/excel")
async def export_bids_excel(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export bid evaluation matrix as Excel"""
    require_staff(current_user)

    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    bids = db.query(Bid).filter(Bid.tender_id == tender_id).all()
    criteria = db.query(EvaluationCriteria).filter(
        EvaluationCriteria.tender_id == tender_id
    ).all()

    bids_data = []
    for bid in bids:
        bid_info = {
            'bidder_name': bid.bidder.company_name if bid.bidder else 'N/A',
            'financial_amount': float(bid.financial_amount or 0),
            'technical_score': float(bid.technical_score or 0),
            'financial_score': float(bid.financial_score or 0),
            'combined_score': float(bid.combined_score or 0),
            'rank': bid.rank,
            'criteria_scores': {}
        }

        for evaluation in bid.evaluations:
            bid_info['criteria_scores'][evaluation.criteria_id] = float(evaluation.score or 0)

        bids_data.append(bid_info)

    criteria_data = [{'id': c.id, 'name': c.criteria_name} for c in criteria]

    try:
        excel_buffer = export_service.export_bids_matrix_excel(
            tender.title,
            bids_data,
            criteria_data
        )

        filename = f"bid_evaluation_{tender.tender_id}_{datetime.now().strftime('%Y%m%d')}.xlsx"

        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Excel export not available. Please install openpyxl."
        )


@router.get("/tender/{tender_id}/bids/csv")
async def export_bids_csv(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export bid list as CSV"""
    require_staff(current_user)

    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    bids = db.query(Bid).filter(Bid.tender_id == tender_id).all()

    data = []
    for bid in bids:
        data.append({
            'bid_number': bid.bid_number,
            'bidder_name': bid.bidder.company_name if bid.bidder else 'N/A',
            'status': bid.status.value if bid.status else 'N/A',
            'financial_amount': float(bid.financial_amount or 0),
            'technical_score': float(bid.technical_score or 0),
            'financial_score': float(bid.financial_score or 0),
            'combined_score': float(bid.combined_score or 0),
            'rank': bid.rank or '',
            'submission_date': bid.submission_date.strftime('%Y-%m-%d %H:%M') if bid.submission_date else ''
        })

    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No bids found for this tender"
        )

    csv_buffer = export_service.export_to_csv(data)
    filename = f"bids_{tender.tender_id}_{datetime.now().strftime('%Y%m%d')}.csv"

    return StreamingResponse(
        csv_buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/reports/tenders/excel")
async def export_tenders_report_excel(
    status_filter: Optional[str] = None,
    department_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export tenders report as Excel"""
    require_staff(current_user)

    query = db.query(Tender)

    if status_filter:
        query = query.filter(Tender.status == status_filter)
    if department_id:
        query = query.filter(Tender.department_id == department_id)

    tenders = query.all()

    data = []
    for tender in tenders:
        data.append({
            'tender_id': tender.tender_id,
            'title': tender.title,
            'department': tender.department.name if tender.department else 'N/A',
            'category': tender.category.name if tender.category else 'N/A',
            'status': tender.status.value if tender.status else 'N/A',
            'tender_type': tender.tender_type.value if tender.tender_type else 'N/A',
            'estimated_value': float(tender.estimated_value or 0),
            'submission_deadline': tender.submission_deadline.strftime('%Y-%m-%d') if tender.submission_deadline else '',
            'created_at': tender.created_at.strftime('%Y-%m-%d') if tender.created_at else '',
            'bids_count': len(tender.bids) if tender.bids else 0
        })

    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tenders found"
        )

    try:
        excel_buffer = export_service.export_to_excel(data, "Tenders Report", "Tender Status Report")
        filename = f"tenders_report_{datetime.now().strftime('%Y%m%d')}.xlsx"

        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Excel export not available. Please install openpyxl."
        )

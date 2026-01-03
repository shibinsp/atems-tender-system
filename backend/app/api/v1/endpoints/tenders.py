from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil
from app.core.dependencies import get_db, get_current_user, require_tender_officer
from app.models.user import User
from app.models.tender import Tender, TenderDocument, TenderEligibility, EvaluationCriteria, TenderStatus
from app.schemas.tender import (
    TenderCreate, TenderUpdate, TenderResponse, TenderListResponse,
    TenderDocumentResponse, TenderEligibilityCreate, TenderEligibilityResponse,
    EvaluationCriteriaCreate, EvaluationCriteriaResponse
)
from app.config import settings

router = APIRouter(prefix="/tenders", tags=["Tenders"])


def generate_tender_id() -> str:
    """Generate unique tender ID"""
    timestamp = datetime.now().strftime("%Y%m%d")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"TND-{timestamp}-{unique_id}"


@router.get("", response_model=TenderListResponse)
async def list_tenders(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    status: Optional[TenderStatus] = None,
    category_id: Optional[int] = None,
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tenders with pagination and filters"""
    query = db.query(Tender)

    # Apply filters
    if status:
        query = query.filter(Tender.status == status)
    if category_id:
        query = query.filter(Tender.category_id == category_id)
    if department_id:
        query = query.filter(Tender.department_id == department_id)
    if search:
        query = query.filter(
            Tender.title.ilike(f"%{search}%") |
            Tender.tender_id.ilike(f"%{search}%")
        )

    # Get total count
    total = query.count()

    # Apply pagination
    tenders = query.order_by(Tender.created_at.desc()).offset((page - 1) * size).limit(size).all()

    return TenderListResponse(
        items=[TenderResponse.model_validate(t) for t in tenders],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )


@router.post("", response_model=TenderResponse, status_code=status.HTTP_201_CREATED)
async def create_tender(
    tender_data: TenderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Create a new tender"""
    tender = Tender(
        tender_id=generate_tender_id(),
        **tender_data.model_dump(),
        created_by=current_user.id,
        status=TenderStatus.DRAFT
    )
    db.add(tender)
    db.commit()
    db.refresh(tender)
    return tender


@router.get("/{tender_id}", response_model=TenderResponse)
async def get_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tender by ID"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    return tender


@router.put("/{tender_id}", response_model=TenderResponse)
async def update_tender(
    tender_id: int,
    tender_data: TenderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Update a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Only allow updates to draft tenders
    if tender.status != TenderStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update draft tenders"
        )

    update_data = tender_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tender, field, value)

    db.commit()
    db.refresh(tender)
    return tender


@router.delete("/{tender_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Delete a draft tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    if tender.status != TenderStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete draft tenders"
        )

    db.delete(tender)
    db.commit()


@router.post("/{tender_id}/publish", response_model=TenderResponse)
async def publish_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Publish a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    if tender.status != TenderStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only publish draft tenders"
        )

    # Validate required fields for publishing
    if not tender.submission_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission deadline is required"
        )

    tender.status = TenderStatus.PUBLISHED
    tender.publishing_date = datetime.utcnow()
    db.commit()
    db.refresh(tender)
    return tender


@router.post("/{tender_id}/cancel", response_model=TenderResponse)
async def cancel_tender(
    tender_id: int,
    reason: str = Query(..., min_length=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Cancel a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    if tender.status in [TenderStatus.AWARDED, TenderStatus.CLOSED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel awarded or closed tenders"
        )

    tender.status = TenderStatus.CANCELLED
    db.commit()
    db.refresh(tender)
    return tender


@router.post("/{tender_id}/clone", response_model=TenderResponse)
async def clone_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Clone an existing tender"""
    original = db.query(Tender).filter(Tender.id == tender_id).first()
    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Create new tender with copied data
    new_tender = Tender(
        tender_id=generate_tender_id(),
        title=f"Copy of {original.title}",
        description=original.description,
        category_id=original.category_id,
        department_id=original.department_id,
        tender_type=original.tender_type,
        tender_stage=original.tender_stage,
        estimated_value=original.estimated_value,
        currency=original.currency,
        emd_amount=original.emd_amount,
        bid_validity_days=original.bid_validity_days,
        created_by=current_user.id,
        status=TenderStatus.DRAFT
    )
    db.add(new_tender)
    db.commit()
    db.refresh(new_tender)

    # Clone eligibility criteria
    for criteria in original.eligibility_criteria:
        new_criteria = TenderEligibility(
            tender_id=new_tender.id,
            criteria_type=criteria.criteria_type,
            criteria_value=criteria.criteria_value,
            is_mandatory=criteria.is_mandatory,
            sort_order=criteria.sort_order
        )
        db.add(new_criteria)

    # Clone evaluation criteria
    for eval_criteria in original.evaluation_criteria:
        new_eval = EvaluationCriteria(
            tender_id=new_tender.id,
            criteria_name=eval_criteria.criteria_name,
            criteria_type=eval_criteria.criteria_type,
            description=eval_criteria.description,
            max_score=eval_criteria.max_score,
            weight=eval_criteria.weight,
            is_mandatory=eval_criteria.is_mandatory,
            sort_order=eval_criteria.sort_order
        )
        db.add(new_eval)

    db.commit()
    db.refresh(new_tender)
    return new_tender


# Document Management
@router.get("/{tender_id}/documents", response_model=List[TenderDocumentResponse])
async def list_tender_documents(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    return tender.documents


@router.post("/{tender_id}/documents", response_model=TenderDocumentResponse)
async def upload_tender_document(
    tender_id: int,
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Upload a document for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Validate file type (PDF only)
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )

    # Check file size
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
        )

    # Save file
    file_uuid = str(uuid.uuid4())
    file_path = f"{settings.UPLOAD_DIR}/tenders/{tender_id}/{file_uuid}.pdf"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Create document record
    document = TenderDocument(
        tender_id=tender_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        uploaded_by=current_user.id
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


# Eligibility Criteria
@router.get("/{tender_id}/eligibility", response_model=List[TenderEligibilityResponse])
async def list_eligibility_criteria(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List eligibility criteria for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    return tender.eligibility_criteria


@router.post("/{tender_id}/eligibility", response_model=TenderEligibilityResponse)
async def add_eligibility_criteria(
    tender_id: int,
    criteria_data: TenderEligibilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Add eligibility criteria to a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    criteria = TenderEligibility(
        tender_id=tender_id,
        **criteria_data.model_dump()
    )
    db.add(criteria)
    db.commit()
    db.refresh(criteria)
    return criteria


# Evaluation Criteria
@router.get("/{tender_id}/evaluation-criteria", response_model=List[EvaluationCriteriaResponse])
async def list_evaluation_criteria(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List evaluation criteria for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    return tender.evaluation_criteria


@router.post("/{tender_id}/evaluation-criteria", response_model=EvaluationCriteriaResponse)
async def add_evaluation_criteria(
    tender_id: int,
    criteria_data: EvaluationCriteriaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Add evaluation criteria to a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    criteria = EvaluationCriteria(
        tender_id=tender_id,
        **criteria_data.model_dump()
    )
    db.add(criteria)
    db.commit()
    db.refresh(criteria)
    return criteria

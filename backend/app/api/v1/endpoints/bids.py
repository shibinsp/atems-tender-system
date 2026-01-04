from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import hashlib
from app.core.dependencies import get_db, get_current_user, require_bidder
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderStatus
from app.models.bid import Bid, BidDocument, BankGuarantee, Bidder, BidStatus, DocumentCategory
from app.schemas.bid import (
    BidCreate, BidUpdate, BidResponse,
    BidDocumentResponse, BankGuaranteeCreate, BankGuaranteeResponse,
    BidderCreate, BidderUpdate, BidderResponse
)
from app.config import settings
from app.utils.helpers import utc_now, is_past, make_aware


router = APIRouter(prefix="/bids", tags=["Bids"])


def generate_bid_number(tender_id: int) -> str:
    """Generate unique bid number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:6].upper()
    return f"BID-{tender_id}-{timestamp}-{unique_id}"


def generate_bid_hash(bid: Bid) -> str:
    """Generate hash for bid integrity"""
    data = f"{bid.id}-{bid.tender_id}-{bid.bidder_id}-{bid.submission_date}"
    return hashlib.sha256(data.encode()).hexdigest()


# Bidder Profile
@router.get("/profile", response_model=BidderResponse)
async def get_bidder_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's bidder profile"""
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bidder profile not found. Please create one first."
        )
    return bidder


@router.post("/profile", response_model=BidderResponse, status_code=status.HTTP_201_CREATED)
async def create_bidder_profile(
    bidder_data: BidderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create bidder profile for current user"""
    # Check if profile already exists
    existing = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bidder profile already exists"
        )

    bidder = Bidder(
        user_id=current_user.id,
        **bidder_data.model_dump(exclude={"user_id"})
    )
    db.add(bidder)
    db.commit()
    db.refresh(bidder)
    return bidder


@router.put("/profile", response_model=BidderResponse)
async def update_bidder_profile(
    bidder_data: BidderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update bidder profile"""
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bidder profile not found"
        )

    update_data = bidder_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bidder, field, value)

    db.commit()
    db.refresh(bidder)
    return bidder


# My Bids
@router.get("/my-bids", response_model=List[BidResponse])
async def get_my_bids(
    status_filter: Optional[BidStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's bids"""
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder:
        return []

    query = db.query(Bid).filter(Bid.bidder_id == bidder.id)
    if status_filter:
        query = query.filter(Bid.status == status_filter)

    return query.order_by(Bid.created_at.desc()).all()


# Bid CRUD for specific tender
@router.get("/tender/{tender_id}", response_model=List[BidResponse])
async def list_bids_for_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all bids for a tender (evaluator/admin view)"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Only admin, tender officer, or evaluator can see all bids
    if current_user.role not in [UserRole.ADMIN, UserRole.TENDER_OFFICER, UserRole.EVALUATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view bids"
        )

    return db.query(Bid).filter(Bid.tender_id == tender_id).all()


@router.post("/tender/{tender_id}", response_model=BidResponse, status_code=status.HTTP_201_CREATED)
async def create_bid(
    tender_id: int,
    bid_data: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new bid for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Check if tender is accepting bids
    if tender.status != TenderStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tender is not accepting bids"
        )

    # Check submission deadline
    if tender.submission_deadline and is_past(tender.submission_deadline):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Submission deadline has passed"
            )

    # Get bidder profile
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please create a bidder profile first"
        )

    # Create bid with unique constraint protection
    try:
        bid = Bid(
            bid_number=generate_bid_number(tender_id),
            tender_id=tender_id,
            bidder_id=bidder.id,
            financial_amount=bid_data.financial_amount,
            status=BidStatus.DRAFT
        )
        db.add(bid)
        db.commit()
        db.refresh(bid)
        return bid
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a bid for this tender"
        )


@router.get("/{bid_id}", response_model=BidResponse)
async def get_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bid details"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check authorization
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    is_owner = bidder and bid.bidder_id == bidder.id
    is_authorized = current_user.role in [UserRole.ADMIN, UserRole.TENDER_OFFICER, UserRole.EVALUATOR]

    if not (is_owner or is_authorized):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this bid"
        )

    return bid


@router.put("/{bid_id}", response_model=BidResponse)
async def update_bid(
    bid_id: int,
    bid_data: BidUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a bid (before submission)"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check ownership
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder or bid.bidder_id != bidder.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this bid"
        )

    # Only allow updates to draft bids
    if bid.status != BidStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update draft bids"
        )

    update_data = bid_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bid, field, value)

    db.commit()
    db.refresh(bid)
    return bid


@router.post("/{bid_id}/submit", response_model=BidResponse)
async def submit_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a bid (final submission)"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check ownership
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder or bid.bidder_id != bidder.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit this bid"
        )

    # Check if already submitted
    if bid.status != BidStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bid has already been submitted"
        )

    # Check tender deadline
    tender = bid.tender
    if tender.submission_deadline and is_past(tender.submission_deadline):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission deadline has passed"
        )

    # Validate required documents
    technical_docs = [d for d in bid.documents if d.document_category == DocumentCategory.TECHNICAL]
    financial_docs = [d for d in bid.documents if d.document_category == DocumentCategory.FINANCIAL]

    if not technical_docs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technical proposal document is required"
        )

    if not financial_docs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Financial proposal document is required"
        )

    # Submit bid (using timezone-aware datetime)
    bid.status = BidStatus.SUBMITTED
    bid.submission_date = utc_now()
    bid.bid_hash = generate_bid_hash(bid)

    db.commit()
    db.refresh(bid)
    return bid


@router.post("/{bid_id}/withdraw", response_model=BidResponse)
async def withdraw_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Withdraw a submitted bid"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check ownership
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder or bid.bidder_id != bidder.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to withdraw this bid"
        )

    # Check tender deadline
    tender = bid.tender
    if tender.submission_deadline and is_past(tender.submission_deadline):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot withdraw after submission deadline"
        )

    bid.status = BidStatus.WITHDRAWN
    db.commit()
    db.refresh(bid)
    return bid


# Bid Documents
@router.get("/{bid_id}/documents", response_model=List[BidDocumentResponse])
async def list_bid_documents(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List documents for a bid"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    return bid.documents


@router.post("/{bid_id}/documents", response_model=BidDocumentResponse)
async def upload_bid_document(
    bid_id: int,
    document_type: str,
    document_category: DocumentCategory,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for a bid"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check ownership
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder or bid.bidder_id != bidder.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload documents"
        )

    # Check if bid is draft
    if bid.status != BidStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload documents after submission"
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
    file_path = f"{settings.UPLOAD_DIR}/bids/{bid_id}/{file_uuid}.pdf"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Create document record
    document = BidDocument(
        bid_id=bid_id,
        document_type=document_type,
        document_category=document_category,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


# Bank Guarantee
@router.post("/{bid_id}/bank-guarantee", response_model=BankGuaranteeResponse)
async def add_bank_guarantee(
    bid_id: int,
    bg_data: BankGuaranteeCreate,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add bank guarantee to a bid"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Check ownership
    bidder = db.query(Bidder).filter(Bidder.user_id == current_user.id).first()
    if not bidder or bid.bidder_id != bidder.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add bank guarantee"
        )

    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )

    # Save file
    file_content = await file.read()
    file_uuid = str(uuid.uuid4())
    file_path = f"{settings.UPLOAD_DIR}/bids/{bid_id}/bg/{file_uuid}.pdf"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Create bank guarantee record
    bg = BankGuarantee(
        bid_id=bid_id,
        document_path=file_path,
        **bg_data.model_dump()
    )
    db.add(bg)
    db.commit()
    db.refresh(bg)
    return bg

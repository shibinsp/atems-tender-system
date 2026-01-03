from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Boolean, ForeignKey, Enum, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)


class BidStatus(str, enum.Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    UNDER_REVIEW = "Under Review"
    QUALIFIED = "Qualified"
    DISQUALIFIED = "Disqualified"
    SHORTLISTED = "Shortlisted"
    AWARDED = "Awarded"
    REJECTED = "Rejected"
    WITHDRAWN = "Withdrawn"


class DocumentCategory(str, enum.Enum):
    PREQUALIFICATION = "Pre-Qualification"
    TECHNICAL = "Technical"
    FINANCIAL = "Financial"


class Bidder(Base):
    __tablename__ = "bidders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    company_name = Column(String(255), nullable=False)
    registration_number = Column(String(100))
    pan_number = Column(String(20))
    gst_number = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="India")
    pincode = Column(String(20))
    website = Column(String(255))
    established_year = Column(Integer)
    annual_turnover = Column(Numeric(18, 2))
    employee_count = Column(Integer)
    is_msme = Column(Boolean, default=False)
    is_startup = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    user = relationship("User")
    bids = relationship("Bid", back_populates="bidder")
    rfis = relationship("RFI", back_populates="bidder")


class Bid(Base):
    __tablename__ = "bids"

    # Unique constraint to prevent duplicate bids from same bidder for same tender
    __table_args__ = (
        UniqueConstraint('tender_id', 'bidder_id', name='uq_bid_tender_bidder'),
    )

    id = Column(Integer, primary_key=True, index=True)
    bid_number = Column(String(50), unique=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False, index=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False, index=True)
    status = Column(Enum(BidStatus), default=BidStatus.DRAFT, index=True)
    submission_date = Column(DateTime)

    # Scores
    technical_score = Column(Numeric(5, 2))
    financial_amount = Column(Numeric(18, 2))
    financial_score = Column(Numeric(5, 2))
    combined_score = Column(Numeric(5, 2))
    rank = Column(Integer)

    # Qualification
    is_responsive = Column(Boolean)
    is_qualified = Column(Boolean)
    remarks = Column(Text)
    bid_hash = Column(String(255))

    # Metadata
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    tender = relationship("Tender", back_populates="bids")
    bidder = relationship("Bidder", back_populates="bids")
    documents = relationship("BidDocument", back_populates="bid", cascade="all, delete-orphan")
    bank_guarantees = relationship("BankGuarantee", back_populates="bid", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="bid")


class BidDocument(Base):
    __tablename__ = "bid_documents"

    id = Column(Integer, primary_key=True, index=True)
    bid_id = Column(Integer, ForeignKey("bids.id"), nullable=False, index=True)
    document_type = Column(String(100), nullable=False)
    document_category = Column(Enum(DocumentCategory), default=DocumentCategory.TECHNICAL)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    is_verified = Column(Boolean, default=False)
    verification_remarks = Column(Text)
    uploaded_at = Column(DateTime, default=utc_now)

    # Relationships
    bid = relationship("Bid", back_populates="documents")


class BankGuarantee(Base):
    __tablename__ = "bank_guarantees"

    id = Column(Integer, primary_key=True, index=True)
    bid_id = Column(Integer, ForeignKey("bids.id"), nullable=False, index=True)
    bg_number = Column(String(100))
    bg_type = Column(String(50))  # EMD, Performance, etc.
    bank_name = Column(String(255))
    branch_name = Column(String(255))
    amount = Column(Numeric(18, 2))
    issue_date = Column(Date)
    expiry_date = Column(Date)
    document_path = Column(String(500))
    status = Column(String(50), default="Active")
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    bid = relationship("Bid", back_populates="bank_guarantees")

from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class TenderStatus(str, enum.Enum):
    DRAFT = "Draft"
    PUBLISHED = "Published"
    UNDER_EVALUATION = "Under Evaluation"
    EVALUATED = "Evaluated"
    AWARDED = "Awarded"
    CANCELLED = "Cancelled"
    CLOSED = "Closed"


class TenderType(str, enum.Enum):
    OPEN = "Open Tender"
    LIMITED = "Limited Tender"
    SINGLE_SOURCE = "Single Source"
    TWO_STAGE = "Two-Stage"
    EOI = "Expression of Interest"


class TenderStage(str, enum.Enum):
    SINGLE = "Single Stage"
    TWO_STAGE = "Two Stage"
    THREE_STAGE = "Three Stage"


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String(50), unique=True, index=True, nullable=False)
    reference_number = Column(String(100))
    title = Column(String(500), nullable=False)
    description = Column(Text)

    # Classification
    category_id = Column(Integer, ForeignKey("categories.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    tender_type = Column(Enum(TenderType), default=TenderType.OPEN)
    tender_stage = Column(Enum(TenderStage), default=TenderStage.SINGLE)

    # Financial
    estimated_value = Column(Numeric(18, 2))
    currency = Column(String(10), default="INR")
    emd_amount = Column(Numeric(18, 2))
    emd_type = Column(String(50))
    bid_validity_days = Column(Integer, default=90)

    # Status
    status = Column(Enum(TenderStatus), default=TenderStatus.DRAFT)

    # Timeline
    publishing_date = Column(DateTime)
    document_download_start = Column(DateTime)
    document_download_end = Column(DateTime)
    submission_start = Column(DateTime)
    submission_deadline = Column(DateTime)
    technical_opening_date = Column(DateTime)
    financial_opening_date = Column(DateTime)

    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="tenders")
    department = relationship("Department", back_populates="tenders")
    creator = relationship("User", back_populates="tenders_created")
    documents = relationship("TenderDocument", back_populates="tender", cascade="all, delete-orphan")
    eligibility_criteria = relationship("TenderEligibility", back_populates="tender", cascade="all, delete-orphan")
    evaluation_criteria = relationship("EvaluationCriteria", back_populates="tender", cascade="all, delete-orphan")
    bids = relationship("Bid", back_populates="tender")
    rfis = relationship("RFI", back_populates="tender")
    evaluations = relationship("Evaluation", back_populates="tender")
    evaluation_committee = relationship("EvaluationCommittee", back_populates="tender")


class TenderDocument(Base):
    __tablename__ = "tender_documents"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="documents")


class TenderEligibility(Base):
    __tablename__ = "tender_eligibility"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    criteria_type = Column(String(100), nullable=False)
    criteria_value = Column(Text)
    is_mandatory = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    # Relationships
    tender = relationship("Tender", back_populates="eligibility_criteria")


class EvaluationCriteria(Base):
    __tablename__ = "evaluation_criteria"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    criteria_name = Column(String(255), nullable=False)
    criteria_type = Column(String(50))  # technical, financial
    description = Column(Text)
    max_score = Column(Numeric(5, 2), default=100)
    weight = Column(Numeric(5, 2), default=1.0)
    is_mandatory = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("evaluation_criteria.id"))
    sort_order = Column(Integer, default=0)

    # Relationships
    tender = relationship("Tender", back_populates="evaluation_criteria")
    evaluations = relationship("Evaluation", back_populates="criteria")
    children = relationship("EvaluationCriteria", backref="parent", remote_side=[id])

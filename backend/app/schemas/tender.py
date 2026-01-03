from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.tender import TenderStatus, TenderType, TenderStage


# Tender Schemas
class TenderBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    description: Optional[str] = None
    reference_number: Optional[str] = None
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    tender_type: TenderType = TenderType.OPEN
    tender_stage: TenderStage = TenderStage.SINGLE
    estimated_value: Optional[Decimal] = None
    currency: str = "INR"
    emd_amount: Optional[Decimal] = None
    emd_type: Optional[str] = None
    bid_validity_days: int = 90


class TenderCreate(TenderBase):
    publishing_date: Optional[datetime] = None
    document_download_start: Optional[datetime] = None
    document_download_end: Optional[datetime] = None
    submission_start: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    technical_opening_date: Optional[datetime] = None
    financial_opening_date: Optional[datetime] = None


class TenderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reference_number: Optional[str] = None
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    tender_type: Optional[TenderType] = None
    tender_stage: Optional[TenderStage] = None
    estimated_value: Optional[Decimal] = None
    currency: Optional[str] = None
    emd_amount: Optional[Decimal] = None
    emd_type: Optional[str] = None
    bid_validity_days: Optional[int] = None
    publishing_date: Optional[datetime] = None
    document_download_start: Optional[datetime] = None
    document_download_end: Optional[datetime] = None
    submission_start: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    technical_opening_date: Optional[datetime] = None
    financial_opening_date: Optional[datetime] = None
    status: Optional[TenderStatus] = None


class TenderResponse(TenderBase):
    id: int
    tender_id: str
    status: TenderStatus
    publishing_date: Optional[datetime] = None
    document_download_start: Optional[datetime] = None
    document_download_end: Optional[datetime] = None
    submission_start: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    technical_opening_date: Optional[datetime] = None
    financial_opening_date: Optional[datetime] = None
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TenderListResponse(BaseModel):
    items: List[TenderResponse]
    total: int
    page: int
    size: int
    pages: int


# Tender Document Schemas
class TenderDocumentBase(BaseModel):
    document_type: str = Field(..., min_length=1, max_length=100)


class TenderDocumentCreate(TenderDocumentBase):
    pass


class TenderDocumentResponse(TenderDocumentBase):
    id: int
    tender_id: int
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# Tender Eligibility Schemas
class TenderEligibilityBase(BaseModel):
    criteria_type: str = Field(..., min_length=1, max_length=100)
    criteria_value: Optional[str] = None
    is_mandatory: bool = True
    sort_order: int = 0


class TenderEligibilityCreate(TenderEligibilityBase):
    pass


class TenderEligibilityResponse(TenderEligibilityBase):
    id: int
    tender_id: int

    class Config:
        from_attributes = True


# Evaluation Criteria Schemas
class EvaluationCriteriaBase(BaseModel):
    criteria_name: str = Field(..., min_length=1, max_length=255)
    criteria_type: Optional[str] = None
    description: Optional[str] = None
    max_score: Decimal = 100
    weight: Decimal = 1.0
    is_mandatory: bool = False
    parent_id: Optional[int] = None
    sort_order: int = 0


class EvaluationCriteriaCreate(EvaluationCriteriaBase):
    pass


class EvaluationCriteriaResponse(EvaluationCriteriaBase):
    id: int
    tender_id: int

    class Config:
        from_attributes = True

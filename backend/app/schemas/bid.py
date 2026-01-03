from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.models.bid import BidStatus, DocumentCategory


# Bidder Schemas
class BidderBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    registration_number: Optional[str] = None
    pan_number: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    pincode: Optional[str] = None
    website: Optional[str] = None
    established_year: Optional[int] = None
    annual_turnover: Optional[Decimal] = None
    employee_count: Optional[int] = None
    is_msme: bool = False
    is_startup: bool = False


class BidderCreate(BidderBase):
    user_id: int


class BidderUpdate(BaseModel):
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    pan_number: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None
    established_year: Optional[int] = None
    annual_turnover: Optional[Decimal] = None
    employee_count: Optional[int] = None
    is_msme: Optional[bool] = None
    is_startup: Optional[bool] = None


class BidderResponse(BidderBase):
    id: int
    user_id: int
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Bid Schemas
class BidBase(BaseModel):
    tender_id: int


class BidCreate(BidBase):
    financial_amount: Optional[Decimal] = None


class BidUpdate(BaseModel):
    financial_amount: Optional[Decimal] = None
    remarks: Optional[str] = None


class BidResponse(BaseModel):
    id: int
    bid_number: str
    tender_id: int
    bidder_id: int
    status: BidStatus
    submission_date: Optional[datetime] = None
    technical_score: Optional[Decimal] = None
    financial_amount: Optional[Decimal] = None
    financial_score: Optional[Decimal] = None
    combined_score: Optional[Decimal] = None
    rank: Optional[int] = None
    is_responsive: Optional[bool] = None
    is_qualified: Optional[bool] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bid Document Schemas
class BidDocumentBase(BaseModel):
    document_type: str = Field(..., min_length=1, max_length=100)
    document_category: DocumentCategory = DocumentCategory.TECHNICAL


class BidDocumentCreate(BidDocumentBase):
    pass


class BidDocumentResponse(BidDocumentBase):
    id: int
    bid_id: int
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    is_verified: bool
    verification_remarks: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# Bank Guarantee Schemas
class BankGuaranteeBase(BaseModel):
    bg_number: Optional[str] = None
    bg_type: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    amount: Optional[Decimal] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None


class BankGuaranteeCreate(BankGuaranteeBase):
    pass


class BankGuaranteeResponse(BankGuaranteeBase):
    id: int
    bid_id: int
    document_path: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

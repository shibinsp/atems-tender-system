from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class ContractStatus(str, Enum):
    DRAFT = "Draft"
    LOI_ISSUED = "LoI Issued"
    LOA_ISSUED = "LoA Issued"
    BG_PENDING = "BG Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    TERMINATED = "Terminated"


class PaymentStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    PAID = "Paid"
    REJECTED = "Rejected"


# Contract Schemas
class ContractCreate(BaseModel):
    tender_id: int
    bid_id: int
    bidder_id: int
    title: Optional[str] = None
    contract_value: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    payment_terms: Optional[str] = None
    penalty_clause: Optional[str] = None
    sla_terms: Optional[str] = None


class ContractResponse(BaseModel):
    id: int
    contract_number: str
    tender_id: int
    bid_id: int
    bidder_id: int
    title: Optional[str]
    contract_value: Optional[Decimal]
    currency: str
    status: ContractStatus
    loi_date: Optional[datetime]
    loa_date: Optional[datetime]
    start_date: Optional[date]
    end_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True


# LoI/LoA Schemas
class LoICreate(BaseModel):
    tender_id: int
    bid_id: int
    contract_value: Decimal
    validity_days: int = 30
    conditions: Optional[str] = None


class LoACreate(BaseModel):
    contract_id: int
    acceptance_date: date
    start_date: date
    end_date: date


# Purchase Order Schemas
class POCreate(BaseModel):
    contract_id: int
    delivery_date: date
    amount: Decimal
    description: Optional[str] = None


class POResponse(BaseModel):
    id: int
    po_number: str
    contract_id: int
    po_date: Optional[date]
    delivery_date: Optional[date]
    amount: Optional[Decimal]
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Invoice Schemas
class InvoiceCreate(BaseModel):
    po_id: int
    invoice_number: str
    invoice_date: date
    amount: Decimal
    tax_amount: Optional[Decimal] = Decimal("0")


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    po_id: int
    invoice_date: Optional[date]
    amount: Optional[Decimal]
    tax_amount: Optional[Decimal]
    total_amount: Optional[Decimal]
    status: PaymentStatus
    payment_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceApproval(BaseModel):
    status: PaymentStatus
    payment_reference: Optional[str] = None


# Corrigendum Schemas
class CorrigendumCreate(BaseModel):
    tender_id: int
    subject: str
    description: str
    changes: Optional[str] = None
    new_submission_deadline: Optional[datetime] = None
    new_opening_date: Optional[datetime] = None


class CorrigendumResponse(BaseModel):
    id: int
    tender_id: int
    corrigendum_number: str
    subject: str
    description: str
    changes: Optional[str]
    new_submission_deadline: Optional[datetime]
    new_opening_date: Optional[datetime]
    published_at: datetime

    class Config:
        from_attributes = True


# Blacklist Schemas
class BlacklistCreate(BaseModel):
    bidder_id: int
    reason: str
    blacklist_date: date
    expiry_date: Optional[date] = None
    is_permanent: bool = False
    reference_tender_id: Optional[int] = None


class BlacklistResponse(BaseModel):
    id: int
    bidder_id: int
    reason: str
    blacklist_date: date
    expiry_date: Optional[date]
    is_permanent: bool
    created_at: datetime

    class Config:
        from_attributes = True


# BG Validation Schemas
class BGValidation(BaseModel):
    bg_id: int
    is_valid: bool
    remarks: Optional[str] = None


class BGResponse(BaseModel):
    id: int
    bid_id: int
    bg_number: Optional[str]
    bg_type: Optional[str]
    bank_name: Optional[str]
    amount: Optional[Decimal]
    issue_date: Optional[date]
    expiry_date: Optional[date]
    status: str
    verified_at: Optional[datetime]

    class Config:
        from_attributes = True


# Delivery/GRN Schemas
class DeliveryCreate(BaseModel):
    contract_id: int
    delivery_date: date
    quantity: int
    description: Optional[str] = None


class DeliveryResponse(BaseModel):
    id: int
    contract_id: int
    grn_number: str
    delivery_date: Optional[date]
    quantity: Optional[int]
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Milestone Schemas
class MilestoneCreate(BaseModel):
    contract_id: int
    milestone_name: str
    description: Optional[str] = None
    due_date: date
    payment_percentage: Optional[Decimal] = None


class MilestoneResponse(BaseModel):
    id: int
    contract_id: int
    milestone_name: str
    description: Optional[str]
    due_date: Optional[date]
    completion_date: Optional[date]
    payment_percentage: Optional[Decimal]
    status: str

    class Config:
        from_attributes = True


# Approval Schemas
class ApprovalType(str, Enum):
    BUDGET = "Budget"
    TECHNICAL = "Technical"
    LEGAL = "Legal"
    FINAL = "Final"


class ApprovalStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class ApprovalCreate(BaseModel):
    tender_id: int
    approval_type: ApprovalType
    budget_head: Optional[str] = None
    cost_center: Optional[str] = None
    estimated_amount: Optional[Decimal] = None
    remarks: Optional[str] = None


class ApprovalAction(BaseModel):
    status: ApprovalStatus
    remarks: Optional[str] = None


class ApprovalResponse(BaseModel):
    id: int
    tender_id: int
    approval_type: ApprovalType
    status: ApprovalStatus
    approver_id: Optional[int]
    approved_at: Optional[datetime]
    remarks: Optional[str]
    budget_head: Optional[str]
    cost_center: Optional[str]
    estimated_amount: Optional[Decimal]
    created_at: datetime

    class Config:
        from_attributes = True

from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Boolean, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class ContractStatus(str, enum.Enum):
    DRAFT = "Draft"
    LOI_ISSUED = "LoI Issued"
    LOA_ISSUED = "LoA Issued"
    BG_PENDING = "BG Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    TERMINATED = "Terminated"


class BGStatus(str, enum.Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    EXPIRED = "Expired"
    RELEASED = "Released"
    INVOKED = "Invoked"


class PaymentStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    PAID = "Paid"
    REJECTED = "Rejected"


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(50), unique=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    bid_id = Column(Integer, ForeignKey("bids.id"), nullable=False)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False)
    
    # Contract Details
    title = Column(String(500))
    contract_value = Column(Numeric(18, 2))
    currency = Column(String(10), default="INR")
    status = Column(Enum(ContractStatus), default=ContractStatus.DRAFT)
    
    # Dates
    loi_date = Column(DateTime)
    loa_date = Column(DateTime)
    start_date = Column(Date)
    end_date = Column(Date)
    warranty_end_date = Column(Date)
    
    # Terms
    payment_terms = Column(Text)
    penalty_clause = Column(Text)
    sla_terms = Column(Text)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tender = relationship("Tender")
    bid = relationship("Bid")
    bidder = relationship("Bidder")
    purchase_orders = relationship("PurchaseOrder", back_populates="contract")
    milestones = relationship("ContractMilestone", back_populates="contract")
    deliveries = relationship("Delivery", back_populates="contract")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    
    po_date = Column(Date)
    delivery_date = Column(Date)
    amount = Column(Numeric(18, 2))
    description = Column(Text)
    status = Column(String(50), default="Issued")
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="purchase_orders")
    invoices = relationship("Invoice", back_populates="purchase_order")


class ContractMilestone(Base):
    __tablename__ = "contract_milestones"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    
    milestone_name = Column(String(255), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    completion_date = Column(Date)
    payment_percentage = Column(Numeric(5, 2))
    status = Column(String(50), default="Pending")
    
    contract = relationship("Contract", back_populates="milestones")


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    grn_number = Column(String(50), unique=True)
    
    delivery_date = Column(Date)
    received_by = Column(Integer, ForeignKey("users.id"))
    quantity = Column(Integer)
    description = Column(Text)
    status = Column(String(50), default="Pending")
    remarks = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    contract = relationship("Contract", back_populates="deliveries")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    
    invoice_date = Column(Date)
    amount = Column(Numeric(18, 2))
    tax_amount = Column(Numeric(18, 2))
    total_amount = Column(Numeric(18, 2))
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Approval
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    payment_date = Column(Date)
    payment_reference = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    purchase_order = relationship("PurchaseOrder", back_populates="invoices")


class Corrigendum(Base):
    __tablename__ = "corrigenda"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    corrigendum_number = Column(String(50))
    
    subject = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    changes = Column(Text)  # JSON of field changes
    
    # Date extensions
    new_submission_deadline = Column(DateTime)
    new_opening_date = Column(DateTime)
    
    published_at = Column(DateTime, default=datetime.utcnow)
    published_by = Column(Integer, ForeignKey("users.id"))
    
    tender = relationship("Tender")


class VendorBlacklist(Base):
    __tablename__ = "vendor_blacklist"

    id = Column(Integer, primary_key=True, index=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False)
    
    reason = Column(Text, nullable=False)
    blacklist_date = Column(Date, nullable=False)
    expiry_date = Column(Date)
    is_permanent = Column(Boolean, default=False)
    
    reference_tender_id = Column(Integer, ForeignKey("tenders.id"))
    document_path = Column(String(500))
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bidder = relationship("Bidder")


class ApprovalStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class ApprovalType(str, enum.Enum):
    BUDGET = "Budget"
    TECHNICAL = "Technical"
    LEGAL = "Legal"
    FINAL = "Final"


class TenderApproval(Base):
    __tablename__ = "tender_approvals"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    approval_type = Column(Enum(ApprovalType), nullable=False)
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    
    approver_id = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    remarks = Column(Text)
    
    # Budget specific
    budget_head = Column(String(100))
    cost_center = Column(String(100))
    estimated_amount = Column(Numeric(18, 2))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tender = relationship("Tender")
    approver = relationship("User")

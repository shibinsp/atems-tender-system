from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class PaymentGatewayTransaction(Base):
    """EMD/BG online payment transactions"""
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    
    transaction_id = Column(String(100), unique=True, index=True)
    order_id = Column(String(100), unique=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    bid_id = Column(Integer, ForeignKey("bids.id"))
    
    payment_type = Column(String(50))  # emd, bg, fee
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String(10), default="INR")
    
    gateway = Column(String(50))  # razorpay, paytm, hdfc
    gateway_response = Column(JSON)
    
    status = Column(String(20), default="pending")  # pending, success, failed, refunded
    
    payment_date = Column(DateTime)
    refund_date = Column(DateTime)
    refund_amount = Column(Numeric(18, 2))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class BudgetHead(Base):
    """Budget heads for tracking"""
    __tablename__ = "budget_heads"

    id = Column(Integer, primary_key=True, index=True)
    
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    department_id = Column(Integer, ForeignKey("departments.id"))
    financial_year = Column(String(10))
    
    allocated_amount = Column(Numeric(18, 2), default=0)
    utilized_amount = Column(Numeric(18, 2), default=0)
    committed_amount = Column(Numeric(18, 2), default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    department = relationship("Department")


class BudgetUtilization(Base):
    """Budget utilization tracking"""
    __tablename__ = "budget_utilization"

    id = Column(Integer, primary_key=True, index=True)
    
    budget_head_id = Column(Integer, ForeignKey("budget_heads.id"), nullable=False)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    
    transaction_type = Column(String(50))  # commitment, utilization, release
    amount = Column(Numeric(18, 2), nullable=False)
    description = Column(Text)
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


class SavingsReport(Base):
    """Savings calculation per tender"""
    __tablename__ = "savings_reports"

    id = Column(Integer, primary_key=True, index=True)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False, unique=True)
    
    estimated_value = Column(Numeric(18, 2))
    awarded_value = Column(Numeric(18, 2))
    savings_amount = Column(Numeric(18, 2))
    savings_percentage = Column(Numeric(5, 2))
    
    l1_amount = Column(Numeric(18, 2))
    l2_amount = Column(Numeric(18, 2))
    average_bid_amount = Column(Numeric(18, 2))
    
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    tender = relationship("Tender")


class InvoiceMilestone(Base):
    """Invoice linked to milestones"""
    __tablename__ = "invoice_milestones"

    id = Column(Integer, primary_key=True, index=True)
    
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    milestone_id = Column(Integer, ForeignKey("contract_milestones.id"), nullable=False)
    
    amount = Column(Numeric(18, 2))
    
    created_at = Column(DateTime, default=datetime.utcnow)

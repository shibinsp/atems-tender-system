from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Numeric, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class VendorStatus(str, enum.Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"
    SUSPENDED = "Suspended"


class EmpanelmentStatus(str, enum.Enum):
    APPLIED = "Applied"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    EXPIRED = "Expired"


class VendorRegistration(Base):
    __tablename__ = "vendor_registrations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    company_name = Column(String(255), nullable=False)
    trade_name = Column(String(255))
    registration_number = Column(String(100))
    incorporation_date = Column(DateTime)
    company_type = Column(String(50))  # Pvt Ltd, LLP, Partnership, Proprietorship
    
    # Tax Info
    pan_number = Column(String(20))
    gst_number = Column(String(20))
    tan_number = Column(String(20))
    
    # Contact
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(20))
    website = Column(String(255))
    
    # Address
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="India")
    pincode = Column(String(20))
    
    # Financial
    annual_turnover = Column(Numeric(18, 2))
    net_worth = Column(Numeric(18, 2))
    employee_count = Column(Integer)
    
    # Classification
    is_msme = Column(Boolean, default=False)
    msme_number = Column(String(50))
    is_startup = Column(Boolean, default=False)
    startup_dpiit_number = Column(String(50))
    is_women_owned = Column(Boolean, default=False)
    is_sc_st_owned = Column(Boolean, default=False)
    
    # Categories
    categories = Column(JSON)  # List of category IDs
    
    # Status
    status = Column(Enum(VendorStatus), default=VendorStatus.PENDING)
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime)
    rejection_reason = Column(Text)
    
    # Documents stored as JSON array
    documents = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class VendorEmpanelment(Base):
    __tablename__ = "vendor_empanelments"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendor_registrations.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    application_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(EmpanelmentStatus), default=EmpanelmentStatus.APPLIED)
    
    valid_from = Column(DateTime)
    valid_until = Column(DateTime)
    
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    remarks = Column(Text)
    
    vendor = relationship("VendorRegistration")
    category = relationship("Category")


class VendorDocument(Base):
    __tablename__ = "vendor_documents"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendor_registrations.id"), nullable=False)
    
    document_type = Column(String(100), nullable=False)
    document_name = Column(String(255))
    file_path = Column(String(500))
    file_size = Column(Integer)
    
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime)
    
    expiry_date = Column(DateTime)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class VendorPerformance(Base):
    __tablename__ = "vendor_performance"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendor_registrations.id"), nullable=False)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    
    # Ratings (1-5)
    quality_rating = Column(Numeric(3, 2))
    delivery_rating = Column(Numeric(3, 2))
    compliance_rating = Column(Numeric(3, 2))
    communication_rating = Column(Numeric(3, 2))
    overall_rating = Column(Numeric(3, 2))
    
    review_comments = Column(Text)
    
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime, default=datetime.utcnow)

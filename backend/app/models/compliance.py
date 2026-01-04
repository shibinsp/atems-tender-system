from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ApprovalMatrix(Base):
    """Configurable approval matrix based on tender value"""
    __tablename__ = "approval_matrix"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False)
    min_value = Column(Numeric(18, 2), default=0)
    max_value = Column(Numeric(18, 2))
    
    # Approval levels required (JSON array of role/user IDs)
    approval_levels = Column(JSON)
    
    department_id = Column(Integer, ForeignKey("departments.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ConflictOfInterest(Base):
    """COI declarations by evaluators"""
    __tablename__ = "conflict_of_interest"

    id = Column(Integer, primary_key=True, index=True)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    has_conflict = Column(Boolean, default=False)
    conflict_description = Column(Text)
    
    declared_at = Column(DateTime, default=datetime.utcnow)
    
    tender = relationship("Tender")
    user = relationship("User")


class ComplianceChecklist(Base):
    """Mandatory checklist items before tender publish"""
    __tablename__ = "compliance_checklist"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))  # pre_publish, pre_award, post_award
    
    is_mandatory = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)


class TenderCompliance(Base):
    """Checklist completion for each tender"""
    __tablename__ = "tender_compliance"

    id = Column(Integer, primary_key=True, index=True)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    checklist_id = Column(Integer, ForeignKey("compliance_checklist.id"), nullable=False)
    
    is_completed = Column(Boolean, default=False)
    completed_by = Column(Integer, ForeignKey("users.id"))
    completed_at = Column(DateTime)
    remarks = Column(Text)
    
    tender = relationship("Tender")
    checklist = relationship("ComplianceChecklist")


class DigitalSignature(Base):
    """Digital signature records"""
    __tablename__ = "digital_signatures"

    id = Column(Integer, primary_key=True, index=True)
    
    document_type = Column(String(50), nullable=False)  # loi, loa, contract, po
    document_id = Column(Integer, nullable=False)
    
    signer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    signer_name = Column(String(255))
    signer_designation = Column(String(255))
    
    signature_type = Column(String(50))  # dsc, aadhaar, esign
    certificate_id = Column(String(255))
    signature_hash = Column(String(500))
    
    signed_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(50))
    
    signer = relationship("User")


class AuditTrailExtended(Base):
    """Extended audit trail with blockchain-ready hash"""
    __tablename__ = "audit_trail_extended"

    id = Column(Integer, primary_key=True, index=True)
    
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user_email = Column(String(255))
    user_role = Column(String(50))
    
    old_values = Column(JSON)
    new_values = Column(JSON)
    
    ip_address = Column(String(50))
    user_agent = Column(Text)
    session_id = Column(String(255))
    
    # Blockchain-ready
    previous_hash = Column(String(256))
    current_hash = Column(String(256))
    
    created_at = Column(DateTime, default=datetime.utcnow)


class TwoFactorAuth(Base):
    """2FA settings for users"""
    __tablename__ = "two_factor_auth"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    is_enabled = Column(Boolean, default=False)
    method = Column(String(20))  # totp, sms, email
    
    secret_key = Column(String(255))  # For TOTP
    backup_codes = Column(JSON)
    
    phone_number = Column(String(20))  # For SMS
    
    last_used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class IPWhitelist(Base):
    """IP whitelist for sensitive operations"""
    __tablename__ = "ip_whitelist"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    
    ip_address = Column(String(50), nullable=False)
    description = Column(String(255))
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserSession(Base):
    """Active user sessions"""
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    session_token = Column(String(255), unique=True)
    device_info = Column(String(255))
    ip_address = Column(String(50))
    location = Column(String(255))
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    
    user = relationship("User")

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class NotificationChannel(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"
    WHATSAPP = "whatsapp"


class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"


class NotificationQueue(Base):
    __tablename__ = "notification_queue"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    channel = Column(Enum(NotificationChannel), default=NotificationChannel.EMAIL)
    
    subject = Column(String(500))
    message = Column(Text, nullable=False)
    template_name = Column(String(100))
    template_data = Column(JSON)
    
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    error_message = Column(Text)
    
    # Reference
    entity_type = Column(String(50))  # tender, bid, contract
    entity_id = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    whatsapp_enabled = Column(Boolean, default=False)
    
    # Event preferences
    tender_published = Column(Boolean, default=True)
    bid_received = Column(Boolean, default=True)
    deadline_reminder = Column(Boolean, default=True)
    evaluation_complete = Column(Boolean, default=True)
    contract_awarded = Column(Boolean, default=True)
    payment_received = Column(Boolean, default=True)
    
    reminder_days_before = Column(Integer, default=3)
    
    user = relationship("User")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    subject = Column(String(500))
    content = Column(Text, nullable=False)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    parent_id = Column(Integer, ForeignKey("messages.id"))
    
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])


class PreBidMeeting(Base):
    __tablename__ = "prebid_meetings"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    
    title = Column(String(500), nullable=False)
    description = Column(Text)
    meeting_date = Column(DateTime, nullable=False)
    meeting_link = Column(String(500))
    venue = Column(String(500))
    is_online = Column(Boolean, default=True)
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tender = relationship("Tender")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    assignee = relationship("User", foreign_keys=[assigned_to])
    assigner = relationship("User", foreign_keys=[assigned_by])

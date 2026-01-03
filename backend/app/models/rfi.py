from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class RFIStatus(str, enum.Enum):
    PENDING = "Pending"
    RESPONDED = "Responded"
    CLOSED = "Closed"


class RFI(Base):
    __tablename__ = "rfis"

    id = Column(Integer, primary_key=True, index=True)
    rfi_number = Column(String(50), index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text)
    status = Column(Enum(RFIStatus), default=RFIStatus.PENDING)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime)
    responded_by = Column(Integer, ForeignKey("users.id"))

    # Relationships
    tender = relationship("Tender", back_populates="rfis")
    bidder = relationship("Bidder", back_populates="rfis")
    responder = relationship("User")

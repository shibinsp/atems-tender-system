from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class EvaluationType(str, enum.Enum):
    L1 = "L1"  # Lowest Price
    L2 = "L2"  # Second Lowest Price
    T1 = "T1"  # Highest Technical Score
    QCBS = "QCBS"  # Quality and Cost Based Selection


class CommitteeRole(str, enum.Enum):
    CHAIRPERSON = "Chairperson"
    MEMBER = "Member"
    SECRETARY = "Secretary"


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    bid_id = Column(Integer, ForeignKey("bids.id"), nullable=False)
    evaluator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    criteria_id = Column(Integer, ForeignKey("evaluation_criteria.id"), nullable=False)
    score = Column(Numeric(5, 2))
    remarks = Column(Text)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="evaluations")
    bid = relationship("Bid", back_populates="evaluations")
    evaluator = relationship("User", back_populates="evaluations")
    criteria = relationship("EvaluationCriteria", back_populates="evaluations")


class EvaluationCommittee(Base):
    __tablename__ = "evaluation_committee"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(CommitteeRole), default=CommitteeRole.MEMBER)
    is_active = Column(Boolean, default=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="evaluation_committee")
    user = relationship("User")

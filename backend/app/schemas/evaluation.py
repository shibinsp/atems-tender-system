from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from app.models.evaluation import CommitteeRole


# Evaluation Schemas
class EvaluationBase(BaseModel):
    criteria_id: int
    score: Decimal = Field(..., ge=0)
    remarks: Optional[str] = None


class EvaluationCreate(EvaluationBase):
    bid_id: int


class EvaluationResponse(EvaluationBase):
    id: int
    tender_id: int
    bid_id: int
    evaluator_id: int
    evaluated_at: datetime

    class Config:
        from_attributes = True


# Evaluation Committee Schemas
class EvaluationCommitteeBase(BaseModel):
    user_id: int
    role: CommitteeRole = CommitteeRole.MEMBER


class EvaluationCommitteeCreate(EvaluationCommitteeBase):
    pass


class EvaluationCommitteeResponse(EvaluationCommitteeBase):
    id: int
    tender_id: int
    is_active: bool
    assigned_at: datetime

    class Config:
        from_attributes = True


# Evaluation Result Schemas
class BidRanking(BaseModel):
    rank: int
    label: str  # L1, L2, T1, etc.
    bid_id: int
    bidder_name: str
    technical_score: Optional[Decimal] = None
    financial_amount: Optional[Decimal] = None
    financial_score: Optional[Decimal] = None
    combined_score: Optional[Decimal] = None
    status: str


class EvaluationResultResponse(BaseModel):
    evaluation_type: str
    tender_id: int
    total_bids: int
    qualified_bids: int
    disqualified_bids: int
    rankings: List[BidRanking]
    weights: Optional[Dict[str, float]] = None


# Comparative Statement Schemas
class BidComparison(BaseModel):
    bid_id: int
    bid_number: str
    bidder_name: str
    company_name: str
    technical_score: Optional[Decimal] = None
    financial_amount: Optional[Decimal] = None
    financial_score: Optional[Decimal] = None
    combined_score: Optional[Decimal] = None
    rank: Optional[int] = None
    is_qualified: bool
    criteria_scores: Optional[Dict[str, Any]] = None


class ComparativeStatementResponse(BaseModel):
    tender_id: int
    tender_title: str
    estimated_value: Optional[Decimal] = None
    evaluation_type: str
    total_bids: int
    qualified_bids: int
    bids: List[BidComparison]
    recommendation: Optional[Dict[str, Any]] = None
    generated_at: datetime

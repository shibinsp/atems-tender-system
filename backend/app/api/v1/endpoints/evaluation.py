from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from app.core.dependencies import get_db, get_current_user, require_evaluator, require_tender_officer
from app.models.user import User
from app.models.tender import Tender, TenderStatus, EvaluationCriteria
from app.models.bid import Bid, BidStatus
from app.models.evaluation import Evaluation, EvaluationCommittee, EvaluationType
from app.schemas.evaluation import (
    EvaluationCreate, EvaluationResponse,
    EvaluationCommitteeCreate, EvaluationCommitteeResponse,
    EvaluationResultResponse, ComparativeStatementResponse,
    BidRanking, BidComparison
)

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.get("/tender/{tender_id}", response_model=List[EvaluationResponse])
async def get_evaluations_for_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_evaluator)
):
    """Get all evaluations for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    return db.query(Evaluation).filter(Evaluation.tender_id == tender_id).all()


@router.post("/tender/{tender_id}/start")
async def start_evaluation(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Start evaluation process for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    if tender.status != TenderStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only start evaluation for published tenders"
        )

    # Check if submission deadline has passed
    if tender.submission_deadline and datetime.utcnow() < tender.submission_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start evaluation before submission deadline"
        )

    tender.status = TenderStatus.UNDER_EVALUATION
    db.commit()

    return {"message": "Evaluation started successfully", "tender_id": tender_id}


@router.get("/tender/{tender_id}/committee", response_model=List[EvaluationCommitteeResponse])
async def get_evaluation_committee(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Get evaluation committee for a tender"""
    return db.query(EvaluationCommittee).filter(
        EvaluationCommittee.tender_id == tender_id,
        EvaluationCommittee.is_active == True
    ).all()


@router.post("/tender/{tender_id}/committee", response_model=EvaluationCommitteeResponse)
async def add_committee_member(
    tender_id: int,
    member_data: EvaluationCommitteeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Add member to evaluation committee"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Check if user is already in committee
    existing = db.query(EvaluationCommittee).filter(
        EvaluationCommittee.tender_id == tender_id,
        EvaluationCommittee.user_id == member_data.user_id,
        EvaluationCommittee.is_active == True
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already in the evaluation committee"
        )

    member = EvaluationCommittee(
        tender_id=tender_id,
        **member_data.model_dump()
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.post("/bid/{bid_id}/evaluate", response_model=EvaluationResponse)
async def evaluate_bid(
    bid_id: int,
    evaluation_data: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_evaluator)
):
    """Submit evaluation scores for a bid"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    tender = bid.tender
    if tender.status != TenderStatus.UNDER_EVALUATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tender is not under evaluation"
        )

    # Check if evaluator is in committee
    committee = db.query(EvaluationCommittee).filter(
        EvaluationCommittee.tender_id == tender.id,
        EvaluationCommittee.user_id == current_user.id,
        EvaluationCommittee.is_active == True
    ).first()
    if not committee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of the evaluation committee"
        )

    # Check if criteria exists
    criteria = db.query(EvaluationCriteria).filter(
        EvaluationCriteria.id == evaluation_data.criteria_id,
        EvaluationCriteria.tender_id == tender.id
    ).first()
    if not criteria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid evaluation criteria"
        )

    # Validate score
    if evaluation_data.score > criteria.max_score:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Score cannot exceed {criteria.max_score}"
        )

    # Check if already evaluated by this evaluator
    existing = db.query(Evaluation).filter(
        Evaluation.bid_id == bid_id,
        Evaluation.evaluator_id == current_user.id,
        Evaluation.criteria_id == evaluation_data.criteria_id
    ).first()
    if existing:
        # Update existing evaluation
        existing.score = evaluation_data.score
        existing.remarks = evaluation_data.remarks
        existing.evaluated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    # Create new evaluation
    evaluation = Evaluation(
        tender_id=tender.id,
        bid_id=bid_id,
        evaluator_id=current_user.id,
        criteria_id=evaluation_data.criteria_id,
        score=evaluation_data.score,
        remarks=evaluation_data.remarks
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    return evaluation


@router.get("/bid/{bid_id}/scores", response_model=List[EvaluationResponse])
async def get_bid_scores(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_evaluator)
):
    """Get all evaluation scores for a bid"""
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    return db.query(Evaluation).filter(Evaluation.bid_id == bid_id).all()


@router.post("/tender/{tender_id}/calculate/{evaluation_type}", response_model=EvaluationResultResponse)
async def calculate_evaluation(
    tender_id: int,
    evaluation_type: EvaluationType,
    technical_weight: float = Query(0.7, ge=0, le=1),
    financial_weight: float = Query(0.3, ge=0, le=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Calculate evaluation results based on type (L1, T1, QCBS)"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    # Get all submitted bids
    bids = db.query(Bid).filter(
        Bid.tender_id == tender_id,
        Bid.status == BidStatus.SUBMITTED
    ).all()

    if not bids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No submitted bids found"
        )

    # Calculate technical scores for each bid
    for bid in bids:
        evaluations = db.query(Evaluation).filter(Evaluation.bid_id == bid.id).all()
        if evaluations:
            total_score = sum(
                float(e.score) * float(e.criteria.weight) for e in evaluations
            )
            bid.technical_score = Decimal(str(total_score))
            bid.is_qualified = total_score >= 60  # Minimum qualifying score

    # Calculate based on evaluation type
    rankings = []

    if evaluation_type == EvaluationType.L1:
        # L1: Lowest price among qualified bidders
        qualified_bids = [b for b in bids if b.is_qualified and b.financial_amount]
        sorted_bids = sorted(qualified_bids, key=lambda x: float(x.financial_amount or 0))

        for rank, bid in enumerate(sorted_bids, 1):
            bid.rank = rank
            rankings.append(BidRanking(
                rank=rank,
                label=f"L{rank}",
                bid_id=bid.id,
                bidder_name=bid.bidder.company_name,
                technical_score=bid.technical_score,
                financial_amount=bid.financial_amount,
                status="Winner" if rank == 1 else "Runner Up"
            ))

    elif evaluation_type == EvaluationType.T1:
        # T1: Highest technical score
        sorted_bids = sorted(bids, key=lambda x: float(x.technical_score or 0), reverse=True)

        for rank, bid in enumerate(sorted_bids, 1):
            bid.rank = rank
            rankings.append(BidRanking(
                rank=rank,
                label=f"T{rank}",
                bid_id=bid.id,
                bidder_name=bid.bidder.company_name,
                technical_score=bid.technical_score,
                financial_amount=bid.financial_amount,
                status="Highest Technical" if rank == 1 else ""
            ))

    elif evaluation_type == EvaluationType.QCBS:
        # QCBS: Quality and Cost Based Selection
        qualified_bids = [b for b in bids if b.is_qualified and b.financial_amount]

        if qualified_bids:
            # Normalize financial scores
            min_amount = min(float(b.financial_amount) for b in qualified_bids)
            for bid in qualified_bids:
                bid.financial_score = Decimal(str((min_amount / float(bid.financial_amount)) * 100))

            # Calculate combined scores
            for bid in qualified_bids:
                tech_component = float(bid.technical_score or 0) * technical_weight
                fin_component = float(bid.financial_score or 0) * financial_weight
                bid.combined_score = Decimal(str(tech_component + fin_component))

            sorted_bids = sorted(qualified_bids, key=lambda x: float(x.combined_score or 0), reverse=True)

            for rank, bid in enumerate(sorted_bids, 1):
                bid.rank = rank
                rankings.append(BidRanking(
                    rank=rank,
                    label=f"QCBS-{rank}",
                    bid_id=bid.id,
                    bidder_name=bid.bidder.company_name,
                    technical_score=bid.technical_score,
                    financial_amount=bid.financial_amount,
                    financial_score=bid.financial_score,
                    combined_score=bid.combined_score,
                    status="Recommended" if rank == 1 else ""
                ))

    db.commit()

    return EvaluationResultResponse(
        evaluation_type=evaluation_type.value,
        tender_id=tender_id,
        total_bids=len(bids),
        qualified_bids=len([b for b in bids if b.is_qualified]),
        disqualified_bids=len([b for b in bids if not b.is_qualified]),
        rankings=rankings,
        weights={"technical": technical_weight, "financial": financial_weight} if evaluation_type == EvaluationType.QCBS else None
    )


@router.get("/tender/{tender_id}/comparative-statement", response_model=ComparativeStatementResponse)
async def get_comparative_statement(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Generate comparative statement for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    bids = db.query(Bid).filter(
        Bid.tender_id == tender_id,
        Bid.status.in_([BidStatus.SUBMITTED, BidStatus.QUALIFIED, BidStatus.SHORTLISTED])
    ).order_by(Bid.rank).all()

    bid_comparisons = []
    for bid in bids:
        # Get criteria scores
        evaluations = db.query(Evaluation).filter(Evaluation.bid_id == bid.id).all()
        criteria_scores = {
            e.criteria.criteria_name: float(e.score) for e in evaluations
        }

        bid_comparisons.append(BidComparison(
            bid_id=bid.id,
            bid_number=bid.bid_number,
            bidder_name=bid.bidder.company_name,
            company_name=bid.bidder.company_name,
            technical_score=bid.technical_score,
            financial_amount=bid.financial_amount,
            financial_score=bid.financial_score,
            combined_score=bid.combined_score,
            rank=bid.rank,
            is_qualified=bid.is_qualified or False,
            criteria_scores=criteria_scores
        ))

    # Generate recommendation
    winner = next((b for b in bids if b.rank == 1), None)
    recommendation = None
    if winner:
        recommendation = {
            "recommended_bidder": winner.bidder.company_name,
            "bid_amount": float(winner.financial_amount) if winner.financial_amount else None,
            "technical_score": float(winner.technical_score) if winner.technical_score else None,
            "rationale": "Highest ranked bidder based on evaluation criteria"
        }

    return ComparativeStatementResponse(
        tender_id=tender_id,
        tender_title=tender.title,
        estimated_value=tender.estimated_value,
        evaluation_type="QCBS",
        total_bids=len(bids),
        qualified_bids=len([b for b in bids if b.is_qualified]),
        bids=bid_comparisons,
        recommendation=recommendation,
        generated_at=datetime.utcnow()
    )


@router.post("/tender/{tender_id}/declare-winner")
async def declare_winner(
    tender_id: int,
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Declare winner for a tender"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )

    bid = db.query(Bid).filter(Bid.id == bid_id, Bid.tender_id == tender_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Update tender status
    tender.status = TenderStatus.AWARDED

    # Update winning bid
    bid.status = BidStatus.AWARDED

    # Update other bids as rejected
    db.query(Bid).filter(
        Bid.tender_id == tender_id,
        Bid.id != bid_id
    ).update({"status": BidStatus.REJECTED})

    db.commit()

    return {
        "message": "Winner declared successfully",
        "tender_id": tender_id,
        "winning_bid_id": bid_id,
        "winner": bid.bidder.company_name
    }

"""
AI-powered evaluation endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ....services.ai_service import ai_service
from ....core.dependencies import get_current_user
from ....models.user import User

router = APIRouter(prefix="/ai", tags=["AI"])


# Request/Response Models
class EligibilityCheckRequest(BaseModel):
    bid_data: Dict[str, Any]
    eligibility_criteria: List[Dict[str, Any]]


class TechnicalScoringRequest(BaseModel):
    proposal_text: str
    evaluation_criteria: List[Dict[str, Any]]
    tender_requirements: str


class DocumentExtractionRequest(BaseModel):
    document_text: str
    document_type: str  # financial, technical, company, experience


class ComparativeAnalysisRequest(BaseModel):
    bids: List[Dict[str, Any]]
    tender_info: Dict[str, Any]
    evaluation_type: str = "L1"  # L1, T1, QCBS


class RFPGenerationRequest(BaseModel):
    section_type: str
    tender_details: Dict[str, Any]
    additional_context: Optional[str] = None


class RiskAnalysisRequest(BaseModel):
    bid_data: Dict[str, Any]
    tender_requirements: Dict[str, Any]


class AIResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None


@router.post("/evaluate-eligibility", response_model=AIResponse)
async def evaluate_eligibility(
    request: EligibilityCheckRequest,
    current_user: User = Depends(get_current_user)
):
    """
    AI-powered eligibility evaluation
    Checks if a bid meets all eligibility criteria
    """
    try:
        result = await ai_service.evaluate_eligibility(
            bid_data=request.bid_data,
            eligibility_criteria=request.eligibility_criteria
        )
        return AIResponse(
            success="error" not in result,
            data=result,
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/score-technical", response_model=AIResponse)
async def score_technical_proposal(
    request: TechnicalScoringRequest,
    current_user: User = Depends(get_current_user)
):
    """
    AI-powered technical proposal scoring
    Scores proposal against evaluation criteria
    """
    try:
        result = await ai_service.score_technical_proposal(
            proposal_text=request.proposal_text,
            evaluation_criteria=request.evaluation_criteria,
            tender_requirements=request.tender_requirements
        )
        return AIResponse(
            success="error" not in result,
            data=result,
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-document", response_model=AIResponse)
async def extract_document_data(
    request: DocumentExtractionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Extract structured data from tender/bid documents
    """
    try:
        result = await ai_service.extract_document_data(
            document_text=request.document_text,
            document_type=request.document_type
        )
        return AIResponse(
            success="error" not in result,
            data=result,
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comparative-analysis", response_model=AIResponse)
async def generate_comparative_analysis(
    request: ComparativeAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered comparative analysis of all bids
    """
    try:
        result = await ai_service.generate_comparative_analysis(
            bids=request.bids,
            tender_info=request.tender_info,
            evaluation_type=request.evaluation_type
        )
        return AIResponse(
            success="error" not in result,
            data=result,
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-rfp-section", response_model=AIResponse)
async def generate_rfp_section(
    request: RFPGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate RFP section content using AI
    """
    try:
        result = await ai_service.generate_rfp_section(
            section_type=request.section_type,
            tender_details=request.tender_details,
            additional_context=request.additional_context
        )
        return AIResponse(
            success="error" not in result,
            data=result,
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-risks", response_model=AIResponse)
async def analyze_bid_risks(
    request: RiskAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze potential risks associated with a bid
    """
    try:
        result = await ai_service.analyze_bid_risks(
            bid_data=request.bid_data,
            tender_requirements=request.tender_requirements
        )
        return AIResponse(
            success="error" not in result,
            data=result,
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class VendorRatingRequest(BaseModel):
    vendor_data: Dict[str, Any]
    past_performance: Optional[List[Dict[str, Any]]] = None


@router.post("/vendor-rating", response_model=AIResponse)
async def calculate_vendor_rating(
    request: VendorRatingRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Calculate AI-powered vendor rating based on profile and past performance
    """
    try:
        result = await ai_service.calculate_vendor_rating(
            vendor_data=request.vendor_data,
            past_performance=request.past_performance
        )
        return AIResponse(
            success="error" not in result,
            data=result,
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def ai_health_check():
    """
    Check AI service health and API connectivity
    """
    from ....config import settings

    has_api_key = bool(settings.MISTRAL_API_KEY)

    return {
        "status": "healthy" if has_api_key else "no_api_key",
        "provider": "Mistral AI",
        "api_configured": has_api_key,
        "available_features": [
            "eligibility_evaluation",
            "technical_scoring",
            "document_extraction",
            "comparative_analysis",
            "rfp_generation",
            "risk_analysis",
            "vendor_rating"
        ] if has_api_key else []
    }

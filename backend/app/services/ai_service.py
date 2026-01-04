"""
AI Service for ATEMS using Mistral API
Provides AI-powered tender evaluation capabilities
"""

import json
import httpx
from typing import Optional, Dict, Any, List
from ..config import settings


class MistralAI:
    """Mistral AI client for tender evaluation"""

    BASE_URL = "https://api.mistral.ai/v1"

    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def _chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "mistral-small-latest",
        temperature: float = 0.3,
        max_tokens: int = 4096
    ) -> str:
        """Make a chat completion request to Mistral API"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def evaluate_eligibility(
        self,
        bid_data: Dict[str, Any],
        eligibility_criteria: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate if a bid meets the eligibility criteria
        Returns compliance status for each criterion
        """
        criteria_text = "\n".join([
            f"- {c['criteria_type']}: {c['criteria_value']}"
            for c in eligibility_criteria
        ])

        bid_info = json.dumps(bid_data, indent=2, default=str)

        prompt = f"""You are an expert government tender evaluator. Analyze the following bid against the eligibility criteria.

ELIGIBILITY CRITERIA:
{criteria_text}

BID INFORMATION:
{bid_info}

Evaluate each criterion and provide a JSON response with the following structure:
{{
    "overall_eligible": true/false,
    "criteria_results": [
        {{
            "criterion": "criterion name",
            "met": true/false,
            "evidence": "evidence from bid that supports this",
            "remarks": "any additional notes"
        }}
    ],
    "summary": "brief summary of eligibility assessment",
    "risk_factors": ["list of any concerns or risks"]
}}

Respond ONLY with valid JSON, no additional text."""

        messages = [
            {"role": "system", "content": "You are a precise government tender evaluation assistant. Always respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._chat_completion(messages)
            # Clean response and parse JSON
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            return json.loads(response.strip())
        except Exception as e:
            return {
                "overall_eligible": None,
                "error": str(e),
                "criteria_results": [],
                "summary": "AI evaluation failed",
                "risk_factors": ["Manual review required"]
            }

    async def score_technical_proposal(
        self,
        proposal_text: str,
        evaluation_criteria: List[Dict[str, Any]],
        tender_requirements: str
    ) -> Dict[str, Any]:
        """
        Score a technical proposal against evaluation criteria
        Returns scores for each criterion with justification
        """
        criteria_text = "\n".join([
            f"- {c['criteria_name']} (Max: {c['max_score']} points, Weight: {c.get('weight', 1)})"
            for c in evaluation_criteria
        ])

        prompt = f"""You are an expert technical evaluator for government tenders. Score the following technical proposal.

TENDER REQUIREMENTS:
{tender_requirements}

EVALUATION CRITERIA:
{criteria_text}

TECHNICAL PROPOSAL:
{proposal_text[:8000]}

Provide a detailed scoring with JSON response:
{{
    "total_score": <number>,
    "max_possible_score": <number>,
    "percentage": <number>,
    "criteria_scores": [
        {{
            "criterion": "criterion name",
            "max_score": <number>,
            "awarded_score": <number>,
            "justification": "detailed reason for this score",
            "strengths": ["list of strengths"],
            "weaknesses": ["list of weaknesses"]
        }}
    ],
    "overall_assessment": "comprehensive assessment summary",
    "recommendations": ["list of recommendations for improvement"],
    "technical_rank": "Excellent/Good/Average/Below Average/Poor"
}}

Be objective and fair. Respond ONLY with valid JSON."""

        messages = [
            {"role": "system", "content": "You are an impartial technical evaluator for government procurement. Score fairly based on evidence in the proposal."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._chat_completion(messages, model="mistral-medium-latest")
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            # Clean control characters
            import re
            response = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', response.strip())
            return json.loads(response)
        except Exception as e:
            return {
                "total_score": 0,
                "max_possible_score": sum(c.get('max_score', 0) for c in evaluation_criteria),
                "percentage": 0,
                "error": str(e),
                "criteria_scores": [],
                "overall_assessment": "AI scoring failed - manual evaluation required",
                "recommendations": [],
                "technical_rank": "Not Evaluated"
            }

    async def extract_document_data(
        self,
        document_text: str,
        document_type: str
    ) -> Dict[str, Any]:
        """
        Extract structured data from tender/bid documents
        """
        type_prompts = {
            "financial": """Extract financial information:
- Total bid amount
- Item-wise pricing
- Taxes and duties
- Payment terms
- Bank guarantee details
- Any discounts offered""",
            "technical": """Extract technical specifications:
- Proposed solution/approach
- Technical specifications
- Delivery timeline
- Team composition
- Past experience
- Certifications""",
            "company": """Extract company information:
- Company name and registration
- GST/Tax numbers
- Annual turnover
- Years in business
- Key personnel
- Office locations""",
            "experience": """Extract experience details:
- Similar projects completed
- Project values
- Client names
- Completion dates
- References"""
        }

        extraction_prompt = type_prompts.get(document_type, type_prompts["technical"])

        prompt = f"""Analyze this document and extract structured information.

DOCUMENT TEXT:
{document_text[:10000]}

EXTRACTION REQUIREMENTS:
{extraction_prompt}

Provide extracted data as JSON:
{{
    "document_type": "{document_type}",
    "extracted_data": {{
        // relevant fields based on document type
    }},
    "confidence": "high/medium/low",
    "missing_information": ["list of expected but missing data"],
    "data_quality": "assessment of data completeness and clarity"
}}

Respond ONLY with valid JSON."""

        messages = [
            {"role": "system", "content": "You are a document analysis expert. Extract data accurately from tender documents."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._chat_completion(messages)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            return json.loads(response.strip())
        except Exception as e:
            return {
                "document_type": document_type,
                "extracted_data": {},
                "error": str(e),
                "confidence": "low",
                "missing_information": ["Extraction failed"],
                "data_quality": "Could not process document"
            }

    async def generate_comparative_analysis(
        self,
        bids: List[Dict[str, Any]],
        tender_info: Dict[str, Any],
        evaluation_type: str = "L1"
    ) -> Dict[str, Any]:
        """
        Generate comprehensive comparative analysis of all bids
        """
        bids_summary = json.dumps(bids, indent=2, default=str)
        tender_summary = json.dumps(tender_info, indent=2, default=str)

        prompt = f"""Generate a comprehensive comparative analysis of these bids for a government tender.

TENDER INFORMATION:
{tender_summary}

EVALUATION TYPE: {evaluation_type}
- L1: Lowest Price (financially qualified lowest bidder wins)
- T1: Highest Technical Score (best technical proposal wins)
- QCBS: Quality and Cost Based Selection (weighted combination)

BIDS SUBMITTED:
{bids_summary}

Provide analysis as JSON:
{{
    "tender_id": "{tender_info.get('id', 'N/A')}",
    "total_bids": {len(bids)},
    "evaluation_type": "{evaluation_type}",
    "ranking": [
        {{
            "rank": 1,
            "bidder_name": "name",
            "bid_id": "id",
            "technical_score": <number or null>,
            "financial_amount": <number>,
            "combined_score": <number or null>,
            "key_strengths": ["list"],
            "key_concerns": ["list"]
        }}
    ],
    "recommended_winner": {{
        "bidder_name": "name",
        "bid_id": "id",
        "justification": "detailed reason for recommendation"
    }},
    "price_analysis": {{
        "lowest_price": <number>,
        "highest_price": <number>,
        "average_price": <number>,
        "estimated_value": <number or null>,
        "savings_percentage": <number or null>
    }},
    "risk_assessment": [
        {{
            "bidder_name": "name",
            "risk_level": "High/Medium/Low",
            "risk_factors": ["list of identified risks"]
        }}
    ],
    "summary": "executive summary of the comparative analysis",
    "recommendations": ["actionable recommendations for the evaluation committee"]
}}

Be thorough and objective. Respond ONLY with valid JSON."""

        messages = [
            {"role": "system", "content": "You are a senior procurement specialist generating comparative bid analysis for government tenders. Be thorough, fair, and objective."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._chat_completion(messages, model="mistral-medium-latest", max_tokens=8000)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            # Clean control characters
            import re
            response = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', response.strip())
            return json.loads(response)
        except Exception as e:
            return {
                "tender_id": tender_info.get('id', 'N/A'),
                "total_bids": len(bids),
                "evaluation_type": evaluation_type,
                "error": str(e),
                "ranking": [],
                "recommended_winner": None,
                "price_analysis": {},
                "risk_assessment": [],
                "summary": "AI analysis failed - manual review required",
                "recommendations": ["Perform manual comparative analysis"]
            }

    async def generate_rfp_section(
        self,
        section_type: str,
        tender_details: Dict[str, Any],
        additional_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate RFP section content using AI
        """
        prompt = f"""Generate professional RFP content for a government tender.

TENDER DETAILS:
- Title: {tender_details.get('title', 'N/A')}
- Category: {tender_details.get('category', 'N/A')}
- Estimated Value: {tender_details.get('estimated_value', 'N/A')}
- Department: {tender_details.get('department', 'N/A')}

SECTION TO GENERATE: {section_type}

{f'ADDITIONAL CONTEXT: {additional_context}' if additional_context else ''}

Generate professional, legally sound content for this RFP section. Follow government procurement standards.

Respond as JSON:
{{
    "section_title": "{section_type}",
    "content": "the generated content in markdown format",
    "key_points": ["list of key points covered"],
    "legal_notes": ["any important legal considerations"],
    "customization_needed": ["aspects that need project-specific customization"]
}}

Respond ONLY with valid JSON."""

        messages = [
            {"role": "system", "content": "You are a government procurement specialist who writes clear, professional RFP documents following legal standards."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._chat_completion(messages)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            return json.loads(response.strip())
        except Exception as e:
            return {
                "section_title": section_type,
                "content": "",
                "error": str(e),
                "key_points": [],
                "legal_notes": [],
                "customization_needed": ["Manual content creation required"]
            }

    async def analyze_bid_risks(
        self,
        bid_data: Dict[str, Any],
        tender_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze potential risks associated with a bid
        """
        prompt = f"""Analyze the risks associated with this bid for a government tender.

TENDER REQUIREMENTS:
{json.dumps(tender_requirements, indent=2, default=str)}

BID DETAILS:
{json.dumps(bid_data, indent=2, default=str)}

Provide comprehensive risk analysis as JSON:
{{
    "overall_risk_level": "High/Medium/Low",
    "risk_score": <1-100>,
    "risks": [
        {{
            "category": "Financial/Technical/Legal/Operational/Compliance",
            "risk": "description of the risk",
            "severity": "High/Medium/Low",
            "likelihood": "High/Medium/Low",
            "impact": "description of potential impact",
            "mitigation": "suggested mitigation measure"
        }}
    ],
    "red_flags": ["list of any serious concerns"],
    "positive_indicators": ["list of positive aspects"],
    "due_diligence_recommendations": ["additional checks recommended"],
    "summary": "overall risk assessment summary"
}}

Be thorough but fair. Respond ONLY with valid JSON."""

        messages = [
            {"role": "system", "content": "You are a risk assessment specialist for government procurement. Identify risks objectively without bias."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._chat_completion(messages)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            return json.loads(response.strip())
        except Exception as e:
            return {
                "overall_risk_level": "Unknown",
                "risk_score": 0,
                "error": str(e),
                "risks": [],
                "red_flags": [],
                "positive_indicators": [],
                "due_diligence_recommendations": ["Manual risk assessment required"],
                "summary": "AI risk analysis failed"
            }

    async def calculate_vendor_rating(
        self,
        vendor_data: Dict[str, Any],
        past_performance: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculate vendor rating based on company profile and past performance
        """
        past_perf_text = ""
        if past_performance:
            past_perf_text = f"\nPAST PERFORMANCE:\n{json.dumps(past_performance, indent=2, default=str)}"

        prompt = f"""Evaluate this vendor and provide a comprehensive rating for government procurement.

VENDOR PROFILE:
{json.dumps(vendor_data, indent=2, default=str)}
{past_perf_text}

Analyze the vendor and provide a rating as JSON:
{{
    "overall_rating": <1-5 stars>,
    "rating_label": "Excellent/Good/Average/Below Average/Poor",
    "confidence_score": <0-100>,
    "category_ratings": {{
        "financial_stability": <1-5>,
        "technical_capability": <1-5>,
        "experience": <1-5>,
        "compliance": <1-5>,
        "delivery_track_record": <1-5>
    }},
    "strengths": ["list of key strengths"],
    "weaknesses": ["list of areas of concern"],
    "recommended_contract_value": "suggested maximum contract value based on capability",
    "suitable_tender_types": ["list of tender types this vendor is suitable for"],
    "risk_tier": "Low Risk/Medium Risk/High Risk/Very High Risk",
    "verification_needed": ["aspects that need verification"],
    "summary": "brief overall assessment"
}}

Be objective and fair. Consider Indian government procurement standards. Respond ONLY with valid JSON."""

        messages = [
            {"role": "system", "content": "You are a vendor assessment specialist for government procurement. Rate vendors objectively based on their profile and capabilities."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await self._chat_completion(messages)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            return json.loads(response.strip())
        except Exception as e:
            return {
                "overall_rating": 0,
                "rating_label": "Not Rated",
                "error": str(e),
                "confidence_score": 0,
                "category_ratings": {},
                "strengths": [],
                "weaknesses": [],
                "risk_tier": "Unknown",
                "summary": "AI rating failed - manual assessment required"
            }


# Global AI service instance
ai_service = MistralAI()

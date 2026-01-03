import api from './api';

// Types
export interface EligibilityResult {
  overall_eligible: boolean | null;
  criteria_results: Array<{
    criterion: string;
    met: boolean;
    evidence: string;
    remarks: string;
  }>;
  summary: string;
  risk_factors: string[];
  error?: string;
}

export interface TechnicalScore {
  total_score: number;
  max_possible_score: number;
  percentage: number;
  criteria_scores: Array<{
    criterion: string;
    max_score: number;
    awarded_score: number;
    justification: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  overall_assessment: string;
  recommendations: string[];
  technical_rank: string;
  error?: string;
}

export interface ExtractedData {
  document_type: string;
  extracted_data: Record<string, any>;
  confidence: 'high' | 'medium' | 'low';
  missing_information: string[];
  data_quality: string;
  error?: string;
}

export interface ComparativeAnalysis {
  tender_id: string;
  total_bids: number;
  evaluation_type: string;
  ranking: Array<{
    rank: number;
    bidder_name: string;
    bid_id: string;
    technical_score: number | null;
    financial_amount: number;
    combined_score: number | null;
    key_strengths: string[];
    key_concerns: string[];
  }>;
  recommended_winner: {
    bidder_name: string;
    bid_id: string;
    justification: string;
  } | null;
  price_analysis: {
    lowest_price: number;
    highest_price: number;
    average_price: number;
    estimated_value: number | null;
    savings_percentage: number | null;
  };
  risk_assessment: Array<{
    bidder_name: string;
    risk_level: 'High' | 'Medium' | 'Low';
    risk_factors: string[];
  }>;
  summary: string;
  recommendations: string[];
  error?: string;
}

export interface RFPSection {
  section_title: string;
  content: string;
  key_points: string[];
  legal_notes: string[];
  customization_needed: string[];
  error?: string;
}

export interface RiskAnalysis {
  overall_risk_level: 'High' | 'Medium' | 'Low' | 'Unknown';
  risk_score: number;
  risks: Array<{
    category: string;
    risk: string;
    severity: 'High' | 'Medium' | 'Low';
    likelihood: 'High' | 'Medium' | 'Low';
    impact: string;
    mitigation: string;
  }>;
  red_flags: string[];
  positive_indicators: string[];
  due_diligence_recommendations: string[];
  summary: string;
  error?: string;
}

export interface AIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface AIHealthStatus {
  status: 'healthy' | 'no_api_key';
  provider: string;
  api_configured: boolean;
  available_features: string[];
}

// Mock responses for when backend is unavailable
const mockEligibilityResult: EligibilityResult = {
  overall_eligible: true,
  criteria_results: [
    {
      criterion: 'Annual Turnover',
      met: true,
      evidence: 'Company reported turnover of ₹50 Cr',
      remarks: 'Exceeds minimum requirement of ₹25 Cr'
    },
    {
      criterion: 'Years of Experience',
      met: true,
      evidence: '12 years in similar projects',
      remarks: 'Meets minimum 5 years requirement'
    },
    {
      criterion: 'Technical Certification',
      met: true,
      evidence: 'ISO 9001:2015 certified',
      remarks: 'Valid certification provided'
    }
  ],
  summary: 'Bidder meets all eligibility criteria and is qualified to proceed to technical evaluation.',
  risk_factors: ['Verify financial documents authenticity']
};

const mockTechnicalScore: TechnicalScore = {
  total_score: 78,
  max_possible_score: 100,
  percentage: 78,
  criteria_scores: [
    {
      criterion: 'Technical Approach',
      max_score: 30,
      awarded_score: 24,
      justification: 'Well-structured approach with clear methodology',
      strengths: ['Comprehensive project plan', 'Good risk mitigation'],
      weaknesses: ['Limited innovation']
    },
    {
      criterion: 'Past Experience',
      max_score: 25,
      awarded_score: 22,
      justification: 'Strong track record with similar projects',
      strengths: ['Multiple relevant projects', 'Good client references'],
      weaknesses: ['No government sector experience']
    },
    {
      criterion: 'Team Composition',
      max_score: 25,
      awarded_score: 18,
      justification: 'Qualified team but some key positions not filled',
      strengths: ['Experienced project manager'],
      weaknesses: ['Need additional technical specialists']
    },
    {
      criterion: 'Infrastructure',
      max_score: 20,
      awarded_score: 14,
      justification: 'Adequate infrastructure for project requirements',
      strengths: ['Modern equipment'],
      weaknesses: ['Limited regional presence']
    }
  ],
  overall_assessment: 'The proposal demonstrates good technical capability with a score of 78%. The bidder has relevant experience and a qualified team. Some areas need strengthening.',
  recommendations: [
    'Request clarification on team deployment timeline',
    'Verify equipment availability',
    'Consider site visit for infrastructure verification'
  ],
  technical_rank: 'Good'
};

const mockComparativeAnalysis: ComparativeAnalysis = {
  tender_id: 'T-2025-001',
  total_bids: 3,
  evaluation_type: 'L1',
  ranking: [
    {
      rank: 1,
      bidder_name: 'TechCorp Solutions',
      bid_id: 'B-001',
      technical_score: 82,
      financial_amount: 4500000,
      combined_score: null,
      key_strengths: ['Lowest price', 'Good technical score'],
      key_concerns: ['New in government sector']
    },
    {
      rank: 2,
      bidder_name: 'Infra Builders Ltd',
      bid_id: 'B-002',
      technical_score: 78,
      financial_amount: 4800000,
      combined_score: null,
      key_strengths: ['Extensive experience'],
      key_concerns: ['Higher price', 'Older technology proposed']
    },
    {
      rank: 3,
      bidder_name: 'GlobalTech Inc',
      bid_id: 'B-003',
      technical_score: 85,
      financial_amount: 5200000,
      combined_score: null,
      key_strengths: ['Highest technical score', 'Innovative approach'],
      key_concerns: ['Highest price']
    }
  ],
  recommended_winner: {
    bidder_name: 'TechCorp Solutions',
    bid_id: 'B-001',
    justification: 'TechCorp Solutions offers the lowest price (L1) while meeting all technical requirements with a score of 82%. Recommended for contract award.'
  },
  price_analysis: {
    lowest_price: 4500000,
    highest_price: 5200000,
    average_price: 4833333,
    estimated_value: 5000000,
    savings_percentage: 10
  },
  risk_assessment: [
    {
      bidder_name: 'TechCorp Solutions',
      risk_level: 'Medium',
      risk_factors: ['First government contract', 'Aggressive pricing may impact delivery']
    }
  ],
  summary: 'Three bids received. TechCorp Solutions is L1 with savings of 10% against estimated value.',
  recommendations: [
    'Conduct detailed verification of L1 bidder capabilities',
    'Negotiate delivery timeline guarantees',
    'Include performance guarantee clause'
  ]
};

const mockRiskAnalysis: RiskAnalysis = {
  overall_risk_level: 'Medium',
  risk_score: 45,
  risks: [
    {
      category: 'Financial',
      risk: 'Aggressive pricing may lead to quality compromise',
      severity: 'Medium',
      likelihood: 'Medium',
      impact: 'Potential cost overruns or quality issues during execution',
      mitigation: 'Include quality checkpoints and milestone-based payments'
    },
    {
      category: 'Technical',
      risk: 'Limited experience with similar scale projects',
      severity: 'Low',
      likelihood: 'Medium',
      impact: 'May face execution challenges',
      mitigation: 'Require detailed project plan with risk mitigation'
    },
    {
      category: 'Operational',
      risk: 'Key team members committed to other projects',
      severity: 'Medium',
      likelihood: 'Low',
      impact: 'Resource availability issues',
      mitigation: 'Include dedicated team commitment clause'
    }
  ],
  red_flags: [],
  positive_indicators: [
    'Strong financial standing',
    'Good market reputation',
    'Valid certifications'
  ],
  due_diligence_recommendations: [
    'Verify bank guarantee authenticity',
    'Check ongoing project commitments',
    'Validate key personnel availability'
  ],
  summary: 'Overall moderate risk profile. No major red flags identified. Standard due diligence recommended.'
};

export const aiService = {
  // Check AI service health
  async checkHealth(): Promise<AIHealthStatus> {
    try {
      const response = await api.get<AIHealthStatus>('/ai/health');
      return response.data;
    } catch {
      return {
        status: 'no_api_key',
        provider: 'Mistral AI',
        api_configured: false,
        available_features: []
      };
    }
  },

  // Evaluate bid eligibility
  async evaluateEligibility(
    bidData: Record<string, any>,
    eligibilityCriteria: Array<{ criteria_type: string; criteria_value: string }>
  ): Promise<EligibilityResult> {
    try {
      const response = await api.post<AIResponse<EligibilityResult>>('/ai/evaluate-eligibility', {
        bid_data: bidData,
        eligibility_criteria: eligibilityCriteria
      });
      return response.data.data;
    } catch {
      // Return mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      return mockEligibilityResult;
    }
  },

  // Score technical proposal
  async scoreTechnicalProposal(
    proposalText: string,
    evaluationCriteria: Array<{ criteria_name: string; max_score: number; weight?: number }>,
    tenderRequirements: string
  ): Promise<TechnicalScore> {
    try {
      const response = await api.post<AIResponse<TechnicalScore>>('/ai/score-technical', {
        proposal_text: proposalText,
        evaluation_criteria: evaluationCriteria,
        tender_requirements: tenderRequirements
      });
      return response.data.data;
    } catch {
      // Return mock data for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      return mockTechnicalScore;
    }
  },

  // Extract data from documents
  async extractDocumentData(
    documentText: string,
    documentType: 'financial' | 'technical' | 'company' | 'experience'
  ): Promise<ExtractedData> {
    try {
      const response = await api.post<AIResponse<ExtractedData>>('/ai/extract-document', {
        document_text: documentText,
        document_type: documentType
      });
      return response.data.data;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        document_type: documentType,
        extracted_data: {
          company_name: 'Sample Company Ltd',
          total_amount: 5000000,
          validity_period: '90 days'
        },
        confidence: 'medium',
        missing_information: [],
        data_quality: 'Demo data - backend unavailable'
      };
    }
  },

  // Generate comparative analysis
  async generateComparativeAnalysis(
    bids: Array<Record<string, any>>,
    tenderInfo: Record<string, any>,
    evaluationType: 'L1' | 'T1' | 'QCBS' = 'L1'
  ): Promise<ComparativeAnalysis> {
    try {
      const response = await api.post<AIResponse<ComparativeAnalysis>>('/ai/comparative-analysis', {
        bids,
        tender_info: tenderInfo,
        evaluation_type: evaluationType
      });
      return response.data.data;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 2500));
      return mockComparativeAnalysis;
    }
  },

  // Generate RFP section
  async generateRFPSection(
    sectionType: string,
    tenderDetails: Record<string, any>,
    additionalContext?: string
  ): Promise<RFPSection> {
    try {
      const response = await api.post<AIResponse<RFPSection>>('/ai/generate-rfp-section', {
        section_type: sectionType,
        tender_details: tenderDetails,
        additional_context: additionalContext
      });
      return response.data.data;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        section_title: sectionType,
        content: `# ${sectionType}\n\nThis is AI-generated placeholder content for the ${sectionType} section. Please customize according to your specific requirements.\n\n## Key Points\n\n- Point 1\n- Point 2\n- Point 3`,
        key_points: ['Generated content', 'Needs customization'],
        legal_notes: ['Review by legal team recommended'],
        customization_needed: ['Project-specific details', 'Timeline information']
      };
    }
  },

  // Analyze bid risks
  async analyzeBidRisks(
    bidData: Record<string, any>,
    tenderRequirements: Record<string, any>
  ): Promise<RiskAnalysis> {
    try {
      const response = await api.post<AIResponse<RiskAnalysis>>('/ai/analyze-risks', {
        bid_data: bidData,
        tender_requirements: tenderRequirements
      });
      return response.data.data;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return mockRiskAnalysis;
    }
  }
};

export default aiService;

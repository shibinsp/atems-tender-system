import api from './api';
import type { RFPTemplate, RFPContent, RFPSection, Clause, ClauseCategory } from '../types';

export interface RFPTemplateCreate {
  name: string;
  category_id?: number;
  content: RFPContent;
}

export interface ClauseCreate {
  title: string;
  category: ClauseCategory;
  content: string;
  is_mandatory?: boolean;
}

export interface GeneratedRFP {
  tender_id: number;
  tender_title: string;
  content: string;
  sections: RFPSection[];
  generated_at: string;
}

// Default RFP sections based on government tender standards
export const DEFAULT_RFP_SECTIONS: RFPSection[] = [
  {
    id: 'introduction',
    title: 'Introduction and Background',
    order: 1,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'intro-purpose', title: 'Purpose of RFP', order: 1, content: '' },
      { id: 'intro-background', title: 'Background', order: 2, content: '' },
      { id: 'intro-objectives', title: 'Objectives', order: 3, content: '' }
    ]
  },
  {
    id: 'scope',
    title: 'Scope of Work',
    order: 2,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'scope-overview', title: 'Overview', order: 1, content: '' },
      { id: 'scope-deliverables', title: 'Deliverables', order: 2, content: '' },
      { id: 'scope-timeline', title: 'Project Timeline', order: 3, content: '' }
    ]
  },
  {
    id: 'eligibility',
    title: 'Eligibility Criteria',
    order: 3,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'elig-general', title: 'General Requirements', order: 1, content: '' },
      { id: 'elig-technical', title: 'Technical Qualifications', order: 2, content: '' },
      { id: 'elig-financial', title: 'Financial Requirements', order: 3, content: '' }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Requirements',
    order: 4,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'tech-specs', title: 'Technical Specifications', order: 1, content: '' },
      { id: 'tech-standards', title: 'Standards & Compliance', order: 2, content: '' },
      { id: 'tech-support', title: 'Support Requirements', order: 3, content: '' }
    ]
  },
  {
    id: 'submission',
    title: 'Submission Guidelines',
    order: 5,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'sub-format', title: 'Proposal Format', order: 1, content: '' },
      { id: 'sub-documents', title: 'Required Documents', order: 2, content: '' },
      { id: 'sub-deadline', title: 'Submission Deadline', order: 3, content: '' }
    ]
  },
  {
    id: 'evaluation',
    title: 'Evaluation Criteria',
    order: 6,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'eval-method', title: 'Evaluation Method', order: 1, content: '' },
      { id: 'eval-criteria', title: 'Scoring Criteria', order: 2, content: '' },
      { id: 'eval-weightage', title: 'Weightage', order: 3, content: '' }
    ]
  },
  {
    id: 'terms',
    title: 'Terms and Conditions',
    order: 7,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'terms-general', title: 'General Terms', order: 1, content: '' },
      { id: 'terms-legal', title: 'Legal Provisions', order: 2, content: '' },
      { id: 'terms-dispute', title: 'Dispute Resolution', order: 3, content: '' }
    ]
  },
  {
    id: 'payment',
    title: 'Payment Terms',
    order: 8,
    content: '',
    is_mandatory: true,
    subsections: [
      { id: 'pay-schedule', title: 'Payment Schedule', order: 1, content: '' },
      { id: 'pay-conditions', title: 'Payment Conditions', order: 2, content: '' },
      { id: 'pay-penalties', title: 'Penalties', order: 3, content: '' }
    ]
  },
  {
    id: 'annexures',
    title: 'Annexures',
    order: 9,
    content: '',
    is_mandatory: false,
    subsections: [
      { id: 'annex-formats', title: 'Bid Formats', order: 1, content: '' },
      { id: 'annex-declarations', title: 'Declarations', order: 2, content: '' },
      { id: 'annex-undertakings', title: 'Undertakings', order: 3, content: '' }
    ]
  }
];

// Default clauses for government RFPs
export const DEFAULT_CLAUSES: Omit<Clause, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'Integrity Pact',
    category: 'Legal',
    content: 'The bidder shall sign an Integrity Pact with the Buyer, committing to transparency and ethical practices throughout the tender process. Any violation of this pact shall result in immediate disqualification and may lead to blacklisting.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'EMD Clause',
    category: 'Financial',
    content: 'Bidders must submit Earnest Money Deposit (EMD) as specified in the tender document. EMD of unsuccessful bidders will be refunded within 30 days of contract award. Failure to submit EMD will result in bid rejection.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'Performance Security',
    category: 'Financial',
    content: 'The successful bidder shall furnish a Performance Security of 10% of the contract value within 15 days of contract award, valid for the contract period plus 60 days. This can be in the form of Bank Guarantee from a scheduled bank.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'MSME Preference',
    category: 'Eligibility',
    content: 'Micro, Small, and Medium Enterprises (MSMEs) registered with relevant authorities are eligible for purchase preference as per government policy. MSMEs must submit valid registration certificates.',
    is_mandatory: false,
    is_active: true
  },
  {
    title: 'Make in India',
    category: 'Eligibility',
    content: 'Preference shall be given to products/services meeting local content requirements under the Make in India initiative. Bidders must declare the percentage of local content in their proposals.',
    is_mandatory: false,
    is_active: true
  },
  {
    title: 'Warranty Clause',
    category: 'Warranty',
    content: 'The supplier shall provide a comprehensive warranty for a minimum period of 12 months from the date of acceptance. During the warranty period, all defective items shall be replaced/repaired at no additional cost.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'Liquidated Damages',
    category: 'Penalty',
    content: 'In case of delay in delivery/completion beyond the stipulated date, liquidated damages at the rate of 0.5% per week subject to a maximum of 10% of the contract value shall be levied.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'Force Majeure',
    category: 'Legal',
    content: 'Neither party shall be liable for failure to perform obligations due to events of Force Majeure including but not limited to natural disasters, war, civil unrest, or government actions. The affected party must notify the other within 14 days.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'Termination Clause',
    category: 'Termination',
    content: 'The Buyer reserves the right to terminate the contract by giving 30 days written notice if the Seller fails to perform obligations satisfactorily. In case of termination for default, Performance Security shall be forfeited.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'Confidentiality',
    category: 'Legal',
    content: 'All information shared during the tender process and contract execution shall be treated as confidential. Neither party shall disclose such information to third parties without prior written consent.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'Compliance with Laws',
    category: 'Compliance',
    content: 'The bidder/contractor shall comply with all applicable laws, rules, regulations, and standards including labor laws, environmental laws, and industry-specific regulations prevailing in India.',
    is_mandatory: true,
    is_active: true
  },
  {
    title: 'Payment Terms - Standard',
    category: 'Payment',
    content: 'Payment shall be made within 30 days of receipt of invoice and acceptance of goods/services. No advance payment shall be made unless specified otherwise. All payments shall be subject to applicable tax deductions.',
    is_mandatory: true,
    is_active: true
  }
];

export const rfpService = {
  // Templates
  async getTemplates(): Promise<RFPTemplate[]> {
    try {
      const response = await api.get<RFPTemplate[]>('/rfp/templates');
      return response.data;
    } catch {
      // Return empty array if endpoint not available
      return [];
    }
  },

  async getTemplate(id: number): Promise<RFPTemplate> {
    const response = await api.get<RFPTemplate>(`/rfp/templates/${id}`);
    return response.data;
  },

  async createTemplate(data: RFPTemplateCreate): Promise<RFPTemplate> {
    const response = await api.post<RFPTemplate>('/rfp/templates', data);
    return response.data;
  },

  async updateTemplate(id: number, data: Partial<RFPTemplateCreate>): Promise<RFPTemplate> {
    const response = await api.put<RFPTemplate>(`/rfp/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/rfp/templates/${id}`);
  },

  // Clauses
  async getClauses(category?: ClauseCategory): Promise<Clause[]> {
    try {
      const params = category ? { category } : {};
      const response = await api.get<Clause[]>('/rfp/clauses', { params });
      return response.data;
    } catch {
      // Return default clauses if endpoint not available
      return DEFAULT_CLAUSES.map((clause, index) => ({
        ...clause,
        id: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
  },

  async getClause(id: number): Promise<Clause> {
    const response = await api.get<Clause>(`/rfp/clauses/${id}`);
    return response.data;
  },

  async createClause(data: ClauseCreate): Promise<Clause> {
    const response = await api.post<Clause>('/rfp/clauses', data);
    return response.data;
  },

  async updateClause(id: number, data: Partial<ClauseCreate>): Promise<Clause> {
    const response = await api.put<Clause>(`/rfp/clauses/${id}`, data);
    return response.data;
  },

  async deleteClause(id: number): Promise<void> {
    await api.delete(`/rfp/clauses/${id}`);
  },

  // Generate RFP
  async generateRFP(tenderId: number, sections: RFPSection[], clauseIds: number[]): Promise<GeneratedRFP> {
    const response = await api.post<GeneratedRFP>('/rfp/generate', {
      tender_id: tenderId,
      sections,
      clause_ids: clauseIds
    });
    return response.data;
  },

  // Export RFP
  async exportRFP(tenderId: number, format: 'pdf' | 'docx'): Promise<Blob> {
    const response = await api.get(`/rfp/export/${tenderId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Helper to get default sections
  getDefaultSections(): RFPSection[] {
    return JSON.parse(JSON.stringify(DEFAULT_RFP_SECTIONS));
  },

  // Helper to get default clauses
  getDefaultClauses(): Omit<Clause, 'id' | 'created_at' | 'updated_at'>[] {
    return DEFAULT_CLAUSES;
  }
};

export default rfpService;

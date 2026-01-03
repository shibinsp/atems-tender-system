import api from './api';
import type {
  Evaluation,
  EvaluationResult,
  ComparativeStatement,
  EvaluationType
} from '../types';

export interface EvaluationCommitteeMember {
  id: number;
  tender_id: number;
  user_id: number;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface EvaluationCreate {
  criteria_id: number;
  score: number;
  remarks?: string;
}

export const evaluationService = {
  // Get evaluations for a tender
  async getEvaluationsForTender(tenderId: number): Promise<Evaluation[]> {
    const response = await api.get<Evaluation[]>(`/evaluation/tender/${tenderId}`);
    return response.data;
  },

  // Start evaluation process
  async startEvaluation(tenderId: number): Promise<{ message: string; tender_id: number }> {
    const response = await api.post(`/evaluation/tender/${tenderId}/start`);
    return response.data;
  },

  // Committee management
  async getCommittee(tenderId: number): Promise<EvaluationCommitteeMember[]> {
    const response = await api.get<EvaluationCommitteeMember[]>(`/evaluation/tender/${tenderId}/committee`);
    return response.data;
  },

  async addCommitteeMember(tenderId: number, userId: number, role: string): Promise<EvaluationCommitteeMember> {
    const response = await api.post<EvaluationCommitteeMember>(`/evaluation/tender/${tenderId}/committee`, {
      user_id: userId,
      role
    });
    return response.data;
  },

  // Bid evaluation
  async evaluateBid(bidId: number, data: EvaluationCreate): Promise<Evaluation> {
    const response = await api.post<Evaluation>(`/evaluation/bid/${bidId}/evaluate`, data);
    return response.data;
  },

  async getBidScores(bidId: number): Promise<Evaluation[]> {
    const response = await api.get<Evaluation[]>(`/evaluation/bid/${bidId}/scores`);
    return response.data;
  },

  // Calculate rankings
  async calculateRanking(
    tenderId: number,
    evaluationType: EvaluationType,
    technicalWeight: number = 0.7,
    financialWeight: number = 0.3
  ): Promise<EvaluationResult> {
    const params = new URLSearchParams({
      technical_weight: technicalWeight.toString(),
      financial_weight: financialWeight.toString()
    });
    const response = await api.post<EvaluationResult>(
      `/evaluation/tender/${tenderId}/calculate/${evaluationType}?${params.toString()}`
    );
    return response.data;
  },

  // Comparative statement
  async getComparativeStatement(tenderId: number): Promise<ComparativeStatement> {
    const response = await api.get<ComparativeStatement>(`/evaluation/tender/${tenderId}/comparative-statement`);
    return response.data;
  },

  // Declare winner
  async declareWinner(tenderId: number, bidId: number): Promise<{ message: string; winner: string }> {
    const response = await api.post(`/evaluation/tender/${tenderId}/declare-winner?bid_id=${bidId}`);
    return response.data;
  }
};

export default evaluationService;

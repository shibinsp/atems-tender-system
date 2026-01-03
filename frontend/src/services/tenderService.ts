import api from './api';
import type {
  Tender,
  TenderListResponse,
  TenderFormData,
  TenderDocument,
  TenderEligibility,
  EvaluationCriteria,
  Category,
  Department
} from '../types';

export interface TenderFilters {
  page?: number;
  size?: number;
  status?: string;
  category_id?: number;
  department_id?: number;
  search?: string;
}

export const tenderService = {
  async getTenders(filters: TenderFilters = {}): Promise<TenderListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.size) params.append('size', filters.size.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.category_id) params.append('category_id', filters.category_id.toString());
    if (filters.department_id) params.append('department_id', filters.department_id.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await api.get<TenderListResponse>(`/tenders?${params.toString()}`);
    return response.data;
  },

  async getTender(id: number): Promise<Tender> {
    const response = await api.get<Tender>(`/tenders/${id}`);
    return response.data;
  },

  async createTender(data: TenderFormData): Promise<Tender> {
    const response = await api.post<Tender>('/tenders', data);
    return response.data;
  },

  async updateTender(id: number, data: Partial<TenderFormData>): Promise<Tender> {
    const response = await api.put<Tender>(`/tenders/${id}`, data);
    return response.data;
  },

  async deleteTender(id: number): Promise<void> {
    await api.delete(`/tenders/${id}`);
  },

  async publishTender(id: number): Promise<Tender> {
    const response = await api.post<Tender>(`/tenders/${id}/publish`);
    return response.data;
  },

  async cancelTender(id: number, reason: string): Promise<Tender> {
    const response = await api.post<Tender>(`/tenders/${id}/cancel?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },

  async cloneTender(id: number): Promise<Tender> {
    const response = await api.post<Tender>(`/tenders/${id}/clone`);
    return response.data;
  },

  // Document management
  async getDocuments(tenderId: number): Promise<TenderDocument[]> {
    const response = await api.get<TenderDocument[]>(`/tenders/${tenderId}/documents`);
    return response.data;
  },

  async uploadDocument(tenderId: number, documentType: string, file: File): Promise<TenderDocument> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<TenderDocument>(
      `/tenders/${tenderId}/documents?document_type=${encodeURIComponent(documentType)}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Eligibility criteria
  async getEligibility(tenderId: number): Promise<TenderEligibility[]> {
    const response = await api.get<TenderEligibility[]>(`/tenders/${tenderId}/eligibility`);
    return response.data;
  },

  async addEligibility(tenderId: number, data: Omit<TenderEligibility, 'id' | 'tender_id'>): Promise<TenderEligibility> {
    const response = await api.post<TenderEligibility>(`/tenders/${tenderId}/eligibility`, data);
    return response.data;
  },

  // Evaluation criteria
  async getEvaluationCriteria(tenderId: number): Promise<EvaluationCriteria[]> {
    const response = await api.get<EvaluationCriteria[]>(`/tenders/${tenderId}/evaluation-criteria`);
    return response.data;
  },

  async addEvaluationCriteria(tenderId: number, data: Omit<EvaluationCriteria, 'id' | 'tender_id'>): Promise<EvaluationCriteria> {
    const response = await api.post<EvaluationCriteria>(`/tenders/${tenderId}/evaluation-criteria`, data);
    return response.data;
  },

  // Categories and Departments
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/admin/categories');
    return response.data;
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>('/admin/departments');
    return response.data;
  }
};

export default tenderService;

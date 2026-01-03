import api from './api';
import type {
  Bid,
  BidDocument,
  BankGuarantee,
  Bidder,
  BidStatus,
  DocumentCategory
} from '../types';

export interface BidderFormData {
  company_name: string;
  registration_number?: string;
  pan_number?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  website?: string;
  established_year?: number;
  annual_turnover?: number;
  employee_count?: number;
  is_msme?: boolean;
  is_startup?: boolean;
}

export interface BankGuaranteeFormData {
  bg_number?: string;
  bg_type?: string;
  bank_name?: string;
  branch_name?: string;
  amount?: number;
  issue_date?: string;
  expiry_date?: string;
}

export const bidService = {
  // Bidder Profile
  async getBidderProfile(): Promise<Bidder> {
    const response = await api.get<Bidder>('/bids/profile');
    return response.data;
  },

  async createBidderProfile(data: BidderFormData): Promise<Bidder> {
    const response = await api.post<Bidder>('/bids/profile', data);
    return response.data;
  },

  async updateBidderProfile(data: Partial<BidderFormData>): Promise<Bidder> {
    const response = await api.put<Bidder>('/bids/profile', data);
    return response.data;
  },

  // My Bids
  async getMyBids(status?: BidStatus): Promise<Bid[]> {
    const params = status ? `?status_filter=${status}` : '';
    const response = await api.get<Bid[]>(`/bids/my-bids${params}`);
    return response.data;
  },

  // Bid CRUD
  async getBidsForTender(tenderId: number): Promise<Bid[]> {
    const response = await api.get<Bid[]>(`/bids/tender/${tenderId}`);
    return response.data;
  },

  async createBid(tenderId: number, financialAmount?: number): Promise<Bid> {
    const response = await api.post<Bid>(`/bids/tender/${tenderId}`, {
      financial_amount: financialAmount
    });
    return response.data;
  },

  async getBid(bidId: number): Promise<Bid> {
    const response = await api.get<Bid>(`/bids/${bidId}`);
    return response.data;
  },

  async updateBid(bidId: number, data: { financial_amount?: number }): Promise<Bid> {
    const response = await api.put<Bid>(`/bids/${bidId}`, data);
    return response.data;
  },

  async submitBid(bidId: number): Promise<Bid> {
    const response = await api.post<Bid>(`/bids/${bidId}/submit`);
    return response.data;
  },

  async withdrawBid(bidId: number): Promise<Bid> {
    const response = await api.post<Bid>(`/bids/${bidId}/withdraw`);
    return response.data;
  },

  // Bid Documents
  async getBidDocuments(bidId: number): Promise<BidDocument[]> {
    const response = await api.get<BidDocument[]>(`/bids/${bidId}/documents`);
    return response.data;
  },

  async uploadBidDocument(
    bidId: number,
    documentType: string,
    documentCategory: DocumentCategory,
    file: File
  ): Promise<BidDocument> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<BidDocument>(
      `/bids/${bidId}/documents?document_type=${encodeURIComponent(documentType)}&document_category=${documentCategory}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Bank Guarantee
  async addBankGuarantee(
    bidId: number,
    data: BankGuaranteeFormData,
    file: File
  ): Promise<BankGuarantee> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    const response = await api.post<BankGuarantee>(
      `/bids/${bidId}/bank-guarantee`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }
};

export default bidService;

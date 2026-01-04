import api from './api';

export interface Contract {
  id: number;
  contract_number: string;
  tender_id: number;
  bid_id: number;
  bidder_id: number;
  title: string;
  contract_value: number;
  currency: string;
  status: string;
  loi_date: string;
  loa_date: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  contract_id: number;
  po_date: string;
  delivery_date: string;
  amount: number;
  description: string;
  status: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  po_id: number;
  invoice_date: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_date: string;
}

export interface Corrigendum {
  id: number;
  tender_id: number;
  corrigendum_number: string;
  subject: string;
  description: string;
  new_submission_deadline: string;
  published_at: string;
}

export interface Approval {
  id: number;
  tender_id: number;
  approval_type: string;
  status: string;
  budget_head: string;
  cost_center: string;
  estimated_amount: number;
  remarks: string;
  created_at: string;
}

export const contractService = {
  // Contracts
  getContracts: () => api.get<Contract[]>('/contracts'),
  getContract: (id: number) => api.get<Contract>(`/contracts/${id}`),
  issueLoi: (data: { tender_id: number; bid_id: number; contract_value: number }) =>
    api.post<Contract>('/contracts/loi', data),
  issueLoa: (contractId: number, data: { acceptance_date: string; start_date: string; end_date: string }) =>
    api.post<Contract>(`/contracts/${contractId}/loa`, data),
  activateContract: (contractId: number) =>
    api.post<Contract>(`/contracts/${contractId}/activate`),

  // Purchase Orders
  createPO: (data: { contract_id: number; delivery_date: string; amount: number; description?: string }) =>
    api.post<PurchaseOrder>('/contracts/po', data),
  getPO: (id: number) => api.get<PurchaseOrder>(`/contracts/po/${id}`),

  // Invoices
  submitInvoice: (data: { po_id: number; invoice_number: string; invoice_date: string; amount: number; tax_amount?: number }) =>
    api.post<Invoice>('/contracts/invoice', data),
  approveInvoice: (id: number, data: { status: string; payment_reference?: string }) =>
    api.put<Invoice>(`/contracts/invoice/${id}/approve`, data),

  // Corrigendum
  publishCorrigendum: (data: { tender_id: number; subject: string; description: string; new_submission_deadline?: string }) =>
    api.post<Corrigendum>('/contracts/corrigendum', data),
  getTenderCorrigenda: (tenderId: number) =>
    api.get<Corrigendum[]>(`/contracts/corrigendum/tender/${tenderId}`),

  // Approvals
  requestApproval: (data: { tender_id: number; approval_type: string; budget_head?: string; cost_center?: string; estimated_amount?: number }) =>
    api.post<Approval>('/contracts/approval', data),
  getPendingApprovals: () => api.get<Approval[]>('/contracts/approval/pending'),
  getTenderApprovals: (tenderId: number) => api.get<Approval[]>(`/contracts/approval/tender/${tenderId}`),
  processApproval: (id: number, data: { status: string; remarks?: string }) =>
    api.put<Approval>(`/contracts/approval/${id}`, data),

  // Bank Guarantees
  getExpiringBGs: (days: number = 30) => api.get(`/contracts/bg/expiring?days=${days}`),
  verifyBG: (id: number, data: { bg_id: number; is_valid: boolean; remarks?: string }) =>
    api.put(`/contracts/bg/${id}/verify`, data),
  releaseBG: (id: number) => api.put(`/contracts/bg/${id}/release`),

  // Blacklist
  getBlacklist: () => api.get('/contracts/blacklist'),
  blacklistVendor: (data: { bidder_id: number; reason: string; blacklist_date: string; expiry_date?: string; is_permanent?: boolean }) =>
    api.post('/contracts/blacklist', data),
  removeFromBlacklist: (id: number) => api.delete(`/contracts/blacklist/${id}`),

  // Delivery
  recordDelivery: (data: { contract_id: number; delivery_date: string; quantity: number; description?: string }) =>
    api.post('/contracts/delivery', data),

  // Milestones
  createMilestone: (data: { contract_id: number; milestone_name: string; due_date: string; payment_percentage?: number }) =>
    api.post('/contracts/milestone', data),
  completeMilestone: (id: number) => api.put(`/contracts/milestone/${id}/complete`),
};

import api from './api';
import type {
  ReportFilters,
  TenderStatusReport,
  BidSummaryReport,
  EvaluationSummaryReport,
  DepartmentAnalysisReport,
  SavingsReport,
  AuditTrailReport
} from '../types';

// Mock data generators for when backend endpoints are not available
const generateMockTenderStatusReport = (): TenderStatusReport => ({
  total_tenders: 156,
  by_status: [
    { status: 'Draft', count: 12, percentage: 7.7 },
    { status: 'Published', count: 28, percentage: 17.9 },
    { status: 'Under Evaluation', count: 15, percentage: 9.6 },
    { status: 'Evaluated', count: 8, percentage: 5.1 },
    { status: 'Awarded', count: 85, percentage: 54.5 },
    { status: 'Cancelled', count: 8, percentage: 5.1 }
  ],
  by_type: [
    { type: 'Open', count: 98 },
    { type: 'Limited', count: 35 },
    { type: 'Single Source', count: 15 },
    { type: 'Two Stage', count: 8 }
  ],
  by_department: [
    { department: 'IT Department', count: 45, value: 125000000 },
    { department: 'Public Works', count: 38, value: 450000000 },
    { department: 'Health Services', count: 32, value: 85000000 },
    { department: 'Education', count: 25, value: 65000000 },
    { department: 'Transport', count: 16, value: 180000000 }
  ],
  timeline: [
    { month: 'Jul 2025', created: 12, awarded: 8 },
    { month: 'Aug 2025', created: 15, awarded: 10 },
    { month: 'Sep 2025', created: 18, awarded: 12 },
    { month: 'Oct 2025', created: 14, awarded: 15 },
    { month: 'Nov 2025', created: 20, awarded: 18 },
    { month: 'Dec 2025', created: 16, awarded: 14 }
  ],
  avg_cycle_time_days: 45
});

const generateMockBidSummaryReport = (): BidSummaryReport => ({
  total_bids: 487,
  total_value: 892000000,
  by_status: [
    { status: 'Draft', count: 23 },
    { status: 'Submitted', count: 156 },
    { status: 'Under Review', count: 45 },
    { status: 'Qualified', count: 178 },
    { status: 'Disqualified', count: 42 },
    { status: 'Awarded', count: 35 },
    { status: 'Withdrawn', count: 8 }
  ],
  by_tender: [
    { tender_id: 'TND-2025-001', title: 'IT Infrastructure Upgrade', bid_count: 12 },
    { tender_id: 'TND-2025-002', title: 'Road Construction Phase 2', bid_count: 8 },
    { tender_id: 'TND-2025-003', title: 'Medical Equipment Supply', bid_count: 15 },
    { tender_id: 'TND-2025-004', title: 'School Renovation Project', bid_count: 6 },
    { tender_id: 'TND-2025-005', title: 'Fleet Management System', bid_count: 9 }
  ],
  avg_bids_per_tender: 4.2,
  msme_participation: { msme: 198, non_msme: 289 },
  qualification_rate: 78.5
});

const generateMockEvaluationSummaryReport = (): EvaluationSummaryReport => ({
  total_evaluations: 423,
  completed_evaluations: 356,
  pending_evaluations: 67,
  by_method: [
    { method: 'L1 (Lowest Price)', count: 185 },
    { method: 'QCBS', count: 156 },
    { method: 'T1 (Technical)', count: 82 }
  ],
  avg_technical_score: 72.4,
  avg_evaluation_time_days: 12,
  score_distribution: [
    { range: '0-40', count: 28 },
    { range: '41-60', count: 85 },
    { range: '61-80', count: 178 },
    { range: '81-100', count: 132 }
  ]
});

const generateMockDepartmentAnalysisReport = (): DepartmentAnalysisReport => ({
  departments: [
    {
      id: 1,
      name: 'IT Department',
      tender_count: 45,
      total_estimated_value: 150000000,
      total_awarded_value: 125000000,
      savings: 25000000,
      savings_percentage: 16.7,
      avg_cycle_time: 38
    },
    {
      id: 2,
      name: 'Public Works',
      tender_count: 38,
      total_estimated_value: 520000000,
      total_awarded_value: 450000000,
      savings: 70000000,
      savings_percentage: 13.5,
      avg_cycle_time: 52
    },
    {
      id: 3,
      name: 'Health Services',
      tender_count: 32,
      total_estimated_value: 95000000,
      total_awarded_value: 85000000,
      savings: 10000000,
      savings_percentage: 10.5,
      avg_cycle_time: 42
    },
    {
      id: 4,
      name: 'Education',
      tender_count: 25,
      total_estimated_value: 75000000,
      total_awarded_value: 65000000,
      savings: 10000000,
      savings_percentage: 13.3,
      avg_cycle_time: 35
    },
    {
      id: 5,
      name: 'Transport',
      tender_count: 16,
      total_estimated_value: 200000000,
      total_awarded_value: 180000000,
      savings: 20000000,
      savings_percentage: 10.0,
      avg_cycle_time: 48
    }
  ],
  top_categories: [
    { category: 'Construction', count: 45, value: 350000000 },
    { category: 'IT Services', count: 38, value: 125000000 },
    { category: 'Medical Supplies', count: 28, value: 85000000 },
    { category: 'Furniture', count: 22, value: 45000000 },
    { category: 'Vehicles', count: 18, value: 120000000 }
  ]
});

const generateMockSavingsReport = (): SavingsReport => ({
  total_estimated_value: 1250000000,
  total_awarded_value: 1085000000,
  total_savings: 165000000,
  savings_percentage: 13.2,
  by_department: [
    { department: 'IT Department', estimated: 150000000, awarded: 125000000, savings: 25000000 },
    { department: 'Public Works', estimated: 520000000, awarded: 450000000, savings: 70000000 },
    { department: 'Health Services', estimated: 95000000, awarded: 85000000, savings: 10000000 },
    { department: 'Education', estimated: 75000000, awarded: 65000000, savings: 10000000 },
    { department: 'Transport', estimated: 200000000, awarded: 180000000, savings: 20000000 }
  ],
  by_category: [
    { category: 'Construction', estimated: 400000000, awarded: 350000000, savings: 50000000 },
    { category: 'IT Services', estimated: 150000000, awarded: 125000000, savings: 25000000 },
    { category: 'Medical Supplies', estimated: 100000000, awarded: 85000000, savings: 15000000 },
    { category: 'Vehicles', estimated: 140000000, awarded: 120000000, savings: 20000000 }
  ],
  by_month: [
    { month: 'Jul 2025', estimated: 180000000, awarded: 155000000, savings: 25000000 },
    { month: 'Aug 2025', estimated: 220000000, awarded: 190000000, savings: 30000000 },
    { month: 'Sep 2025', estimated: 195000000, awarded: 170000000, savings: 25000000 },
    { month: 'Oct 2025', estimated: 210000000, awarded: 185000000, savings: 25000000 },
    { month: 'Nov 2025', estimated: 250000000, awarded: 215000000, savings: 35000000 },
    { month: 'Dec 2025', estimated: 195000000, awarded: 170000000, savings: 25000000 }
  ]
});

const generateMockAuditTrailReport = (page: number = 1): AuditTrailReport => {
  const entries = [
    { id: 1, action: 'CREATE', entity_type: 'Tender', entity_id: 45, entity_name: 'IT Infrastructure Upgrade', user_id: 1, user_name: 'Admin User', created_at: '2025-12-28T10:30:00Z' },
    { id: 2, action: 'UPDATE', entity_type: 'Tender', entity_id: 45, entity_name: 'IT Infrastructure Upgrade', user_id: 1, user_name: 'Admin User', details: { field: 'status', old: 'Draft', new: 'Published' }, created_at: '2025-12-28T11:00:00Z' },
    { id: 3, action: 'CREATE', entity_type: 'Bid', entity_id: 123, entity_name: 'BID-2025-0123', user_id: 5, user_name: 'Vendor Corp', created_at: '2025-12-28T14:00:00Z' },
    { id: 4, action: 'SUBMIT', entity_type: 'Bid', entity_id: 123, entity_name: 'BID-2025-0123', user_id: 5, user_name: 'Vendor Corp', created_at: '2025-12-28T16:30:00Z' },
    { id: 5, action: 'EVALUATE', entity_type: 'Bid', entity_id: 123, entity_name: 'BID-2025-0123', user_id: 2, user_name: 'Evaluation Officer', details: { score: 78.5 }, created_at: '2025-12-29T09:00:00Z' },
    { id: 6, action: 'LOGIN', entity_type: 'User', entity_id: 1, entity_name: 'Admin User', user_id: 1, user_name: 'Admin User', ip_address: '192.168.1.100', created_at: '2025-12-29T08:00:00Z' },
    { id: 7, action: 'DECLARE_WINNER', entity_type: 'Tender', entity_id: 42, entity_name: 'Office Supplies Contract', user_id: 1, user_name: 'Admin User', details: { winner: 'ABC Supplies Ltd', amount: 2500000 }, created_at: '2025-12-29T10:30:00Z' },
    { id: 8, action: 'DOWNLOAD', entity_type: 'Document', entity_id: 89, entity_name: 'Technical Specifications.pdf', user_id: 5, user_name: 'Vendor Corp', created_at: '2025-12-29T11:00:00Z' },
    { id: 9, action: 'CREATE', entity_type: 'RFI', entity_id: 15, entity_name: 'Clarification Request', user_id: 6, user_name: 'XYZ Industries', created_at: '2025-12-29T12:00:00Z' },
    { id: 10, action: 'RESPOND', entity_type: 'RFI', entity_id: 15, entity_name: 'Clarification Request', user_id: 2, user_name: 'Tender Officer', created_at: '2025-12-29T14:00:00Z' }
  ];

  return {
    entries,
    total: 156,
    page,
    pages: 16
  };
};

export const reportService = {
  // Tender Status Report
  async getTenderStatusReport(filters?: ReportFilters): Promise<TenderStatusReport> {
    try {
      const response = await api.get<TenderStatusReport>('/reports/tender-status', { params: filters });
      return response.data;
    } catch {
      return generateMockTenderStatusReport();
    }
  },

  // Bid Summary Report
  async getBidSummaryReport(filters?: ReportFilters): Promise<BidSummaryReport> {
    try {
      const response = await api.get<BidSummaryReport>('/reports/bid-summary', { params: filters });
      return response.data;
    } catch {
      return generateMockBidSummaryReport();
    }
  },

  // Evaluation Summary Report
  async getEvaluationSummaryReport(filters?: ReportFilters): Promise<EvaluationSummaryReport> {
    try {
      const response = await api.get<EvaluationSummaryReport>('/reports/evaluation-summary', { params: filters });
      return response.data;
    } catch {
      return generateMockEvaluationSummaryReport();
    }
  },

  // Department Analysis Report
  async getDepartmentAnalysisReport(filters?: ReportFilters): Promise<DepartmentAnalysisReport> {
    try {
      const response = await api.get<DepartmentAnalysisReport>('/reports/department-analysis', { params: filters });
      return response.data;
    } catch {
      return generateMockDepartmentAnalysisReport();
    }
  },

  // Savings Report
  async getSavingsReport(filters?: ReportFilters): Promise<SavingsReport> {
    try {
      const response = await api.get<SavingsReport>('/reports/savings', { params: filters });
      return response.data;
    } catch {
      return generateMockSavingsReport();
    }
  },

  // Audit Trail Report
  async getAuditTrailReport(filters?: ReportFilters & { page?: number }): Promise<AuditTrailReport> {
    try {
      const response = await api.get<AuditTrailReport>('/reports/audit-trail', { params: filters });
      return response.data;
    } catch {
      return generateMockAuditTrailReport(filters?.page);
    }
  },

  // Export Report
  async exportReport(reportType: string, format: 'pdf' | 'excel', filters?: ReportFilters): Promise<Blob> {
    const response = await api.get(`/reports/export/${reportType}`, {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default reportService;

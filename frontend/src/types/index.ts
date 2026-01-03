// User Types
export type UserRole = 'Admin' | 'Tender Officer' | 'Evaluator' | 'Bidder' | 'Viewer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  department_id?: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Department & Category Types
export interface Department {
  id: number;
  name: string;
  code?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Tender Types
export type TenderStatus = 'Draft' | 'Published' | 'Under Evaluation' | 'Evaluated' | 'Awarded' | 'Cancelled' | 'Closed';
export type TenderType = 'Open Tender' | 'Limited Tender' | 'Single Source' | 'Two-Stage' | 'Expression of Interest';
export type TenderStage = 'Single Stage' | 'Two Stage' | 'Three Stage';

export interface Tender {
  id: number;
  tender_id: string;
  reference_number?: string;
  title: string;
  description?: string;
  category_id?: number;
  department_id?: number;
  tender_type: TenderType;
  tender_stage: TenderStage;
  estimated_value?: number;
  currency: string;
  emd_amount?: number;
  emd_type?: string;
  bid_validity_days: number;
  status: TenderStatus;
  publishing_date?: string;
  document_download_start?: string;
  document_download_end?: string;
  submission_start?: string;
  submission_deadline?: string;
  technical_opening_date?: string;
  financial_opening_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface TenderListResponse {
  items: Tender[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TenderDocument {
  id: number;
  tender_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  uploaded_at: string;
}

export interface TenderEligibility {
  id: number;
  tender_id: number;
  criteria_type: string;
  criteria_value?: string;
  is_mandatory: boolean;
  sort_order: number;
}

export interface EvaluationCriteria {
  id: number;
  tender_id: number;
  criteria_name: string;
  criteria_type?: string;
  description?: string;
  max_score: number;
  weight: number;
  is_mandatory: boolean;
  parent_id?: number;
  sort_order: number;
}

// Bidder & Bid Types
export interface Bidder {
  id: number;
  user_id: number;
  company_name: string;
  registration_number?: string;
  pan_number?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
  website?: string;
  established_year?: number;
  annual_turnover?: number;
  employee_count?: number;
  is_msme: boolean;
  is_startup: boolean;
  is_verified: boolean;
  created_at: string;
}

export type BidStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Qualified' | 'Disqualified' | 'Shortlisted' | 'Awarded' | 'Rejected' | 'Withdrawn';
export type DocumentCategory = 'Pre-Qualification' | 'Technical' | 'Financial';

export interface Bid {
  id: number;
  bid_number: string;
  tender_id: number;
  bidder_id: number;
  status: BidStatus;
  submission_date?: string;
  technical_score?: number;
  financial_amount?: number;
  financial_score?: number;
  combined_score?: number;
  rank?: number;
  is_responsive?: boolean;
  is_qualified?: boolean;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface BidDocument {
  id: number;
  bid_id: number;
  document_type: string;
  document_category: DocumentCategory;
  file_name: string;
  file_path: string;
  file_size?: number;
  is_verified: boolean;
  verification_remarks?: string;
  uploaded_at: string;
}

export interface BankGuarantee {
  id: number;
  bid_id: number;
  bg_number?: string;
  bg_type?: string;
  bank_name?: string;
  branch_name?: string;
  amount?: number;
  issue_date?: string;
  expiry_date?: string;
  document_path?: string;
  status: string;
  created_at: string;
}

// Evaluation Types
export type EvaluationType = 'L1' | 'L2' | 'T1' | 'QCBS';

export interface Evaluation {
  id: number;
  tender_id: number;
  bid_id: number;
  evaluator_id: number;
  criteria_id: number;
  score: number;
  remarks?: string;
  evaluated_at: string;
}

export interface BidRanking {
  rank: number;
  label: string;
  bid_id: number;
  bidder_name: string;
  technical_score?: number;
  financial_amount?: number;
  financial_score?: number;
  combined_score?: number;
  status: string;
}

export interface EvaluationResult {
  evaluation_type: string;
  tender_id: number;
  total_bids: number;
  qualified_bids: number;
  disqualified_bids: number;
  rankings: BidRanking[];
  weights?: { technical: number; financial: number };
}

export interface ComparativeStatement {
  tender_id: number;
  tender_title: string;
  estimated_value?: number;
  evaluation_type: string;
  total_bids: number;
  qualified_bids: number;
  bids: BidComparison[];
  recommendation?: {
    recommended_bidder: string;
    bid_amount?: number;
    technical_score?: number;
    rationale: string;
  };
  generated_at: string;
}

export interface BidComparison {
  bid_id: number;
  bid_number: string;
  bidder_name: string;
  company_name: string;
  technical_score?: number;
  financial_amount?: number;
  financial_score?: number;
  combined_score?: number;
  rank?: number;
  is_qualified: boolean;
  criteria_scores?: Record<string, number>;
}

// Dashboard Types
export interface DashboardStats {
  active_tenders: number;
  pending_evaluations?: number;
  total_bids?: number;
  upcoming_deadlines: number;
  my_bids?: number;
}

export interface ChartData {
  status_distribution: { status: string; count: number }[];
  monthly_tenders: { month: string; count: number }[];
}

export interface Activity {
  id: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  user_id?: number;
  created_at: string;
}

export interface UpcomingDeadline {
  id: number;
  tender_id: string;
  title: string;
  submission_deadline: string;
  days_remaining: number;
}

// Form Types
export interface TenderFormData {
  title: string;
  description?: string;
  reference_number?: string;
  category_id?: number;
  department_id?: number;
  tender_type: TenderType;
  tender_stage: TenderStage;
  estimated_value?: number;
  currency: string;
  emd_amount?: number;
  emd_type?: string;
  bid_validity_days: number;
  publishing_date?: string;
  document_download_start?: string;
  document_download_end?: string;
  submission_start?: string;
  submission_deadline?: string;
  technical_opening_date?: string;
  financial_opening_date?: string;
}

export interface BidFormData {
  tender_id: number;
  financial_amount?: number;
}

// API Response Types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// RFP Types
export interface RFPTemplate {
  id: number;
  name: string;
  category_id?: number;
  content: RFPContent;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface RFPContent {
  sections: RFPSection[];
  metadata?: {
    version?: string;
    last_modified?: string;
  };
}

export interface RFPSection {
  id: string;
  title: string;
  order: number;
  content: string;
  is_mandatory: boolean;
  subsections?: RFPSubsection[];
}

export interface RFPSubsection {
  id: string;
  title: string;
  order: number;
  content: string;
}

export interface Clause {
  id: number;
  title: string;
  category: string;
  content: string;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ClauseCategory =
  | 'General'
  | 'Eligibility'
  | 'Technical'
  | 'Financial'
  | 'Legal'
  | 'Compliance'
  | 'Payment'
  | 'Penalty'
  | 'Warranty'
  | 'Termination';

export interface RFPGeneratorState {
  template_id?: number;
  tender_id?: number;
  sections: RFPSection[];
  selectedClauses: number[];
}

// Report Types
export type ReportType =
  | 'tender_status'
  | 'bid_summary'
  | 'evaluation_summary'
  | 'department_analysis'
  | 'savings_report'
  | 'audit_trail';

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  department_id?: number;
  category_id?: number;
  status?: string;
  tender_type?: TenderType;
}

export interface TenderStatusReport {
  total_tenders: number;
  by_status: { status: string; count: number; percentage: number }[];
  by_type: { type: string; count: number }[];
  by_department: { department: string; count: number; value: number }[];
  timeline: { month: string; created: number; awarded: number }[];
  avg_cycle_time_days: number;
}

export interface BidSummaryReport {
  total_bids: number;
  total_value: number;
  by_status: { status: string; count: number }[];
  by_tender: { tender_id: string; title: string; bid_count: number }[];
  avg_bids_per_tender: number;
  msme_participation: { msme: number; non_msme: number };
  qualification_rate: number;
}

export interface EvaluationSummaryReport {
  total_evaluations: number;
  completed_evaluations: number;
  pending_evaluations: number;
  by_method: { method: string; count: number }[];
  avg_technical_score: number;
  avg_evaluation_time_days: number;
  score_distribution: { range: string; count: number }[];
}

export interface DepartmentAnalysisReport {
  departments: {
    id: number;
    name: string;
    tender_count: number;
    total_estimated_value: number;
    total_awarded_value: number;
    savings: number;
    savings_percentage: number;
    avg_cycle_time: number;
  }[];
  top_categories: { category: string; count: number; value: number }[];
}

export interface SavingsReport {
  total_estimated_value: number;
  total_awarded_value: number;
  total_savings: number;
  savings_percentage: number;
  by_department: { department: string; estimated: number; awarded: number; savings: number }[];
  by_category: { category: string; estimated: number; awarded: number; savings: number }[];
  by_month: { month: string; estimated: number; awarded: number; savings: number }[];
}

export interface AuditTrailEntry {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  entity_name?: string;
  user_id: number;
  user_name: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface AuditTrailReport {
  entries: AuditTrailEntry[];
  total: number;
  page: number;
  pages: number;
}

// Admin Types
export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  department_id?: number;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  role?: UserRole;
  department_id?: number;
  is_active?: boolean;
}

export interface DepartmentCreate {
  name: string;
  code?: string;
  parent_id?: number;
}

export interface DepartmentUpdate {
  name?: string;
  code?: string;
  parent_id?: number;
  is_active?: boolean;
}

export interface CategoryCreate {
  name: string;
  code?: string;
  parent_id?: number;
  description?: string;
}

export interface CategoryUpdate {
  name?: string;
  code?: string;
  parent_id?: number;
  description?: string;
  is_active?: boolean;
}

export interface SystemSettings {
  site_name: string;
  site_logo?: string;
  default_currency: string;
  date_format: string;
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_publish_rfp: boolean;
  min_bids_required: number;
  emd_percentage: number;
  performance_security_percentage: number;
  max_file_size_mb: number;
  allowed_file_types: string[];
}

// Use environment variable for API URL, fallback to relative path for Docker
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const TENDER_STATUSES = [
  'Draft',
  'Published',
  'Under Evaluation',
  'Evaluated',
  'Awarded',
  'Cancelled',
  'Closed'
] as const;

export const TENDER_TYPES = [
  'Open Tender',
  'Limited Tender',
  'Single Source',
  'Two-Stage',
  'Expression of Interest'
] as const;

export const TENDER_STAGES = [
  'Single Stage',
  'Two Stage',
  'Three Stage'
] as const;

export const BID_STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Qualified',
  'Disqualified',
  'Shortlisted',
  'Awarded',
  'Rejected',
  'Withdrawn'
] as const;

export const USER_ROLES = [
  'Admin',
  'Tender Officer',
  'Evaluator',
  'Bidder',
  'Viewer'
] as const;

export const DOCUMENT_CATEGORIES = [
  'Pre-Qualification',
  'Technical',
  'Financial'
] as const;

export const EVALUATION_TYPES = [
  'L1',
  'L2',
  'T1',
  'QCBS'
] as const;

export const STATUS_COLORS: Record<string, string> = {
  'Draft': 'bg-gray-100 text-gray-700',
  'Published': 'bg-blue-100 text-blue-700',
  'Under Evaluation': 'bg-yellow-100 text-yellow-700',
  'Evaluated': 'bg-purple-100 text-purple-700',
  'Awarded': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'Closed': 'bg-gray-100 text-gray-700',
  'Submitted': 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  'Qualified': 'bg-green-100 text-green-700',
  'Disqualified': 'bg-red-100 text-red-700',
  'Shortlisted': 'bg-purple-100 text-purple-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Withdrawn': 'bg-gray-100 text-gray-700'
};

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

export const ELIGIBILITY_CRITERIA_TYPES = [
  'Minimum Turnover',
  'Years of Experience',
  'ISO Certification',
  'Company Registration',
  'GST Registration',
  'PAN Card',
  'Bank Guarantee',
  'EMD',
  'Previous Work Experience',
  'Technical Capability',
  'Geographic Eligibility',
  'MSME Preference',
  'Startup Preference',
  'Other'
];

export const DOCUMENT_TYPES = [
  'Technical Proposal',
  'Financial Proposal',
  'Company Registration',
  'PAN Card',
  'GST Certificate',
  'Bank Guarantee',
  'EMD Receipt',
  'ISO Certificate',
  'Previous Work Orders',
  'Financial Statements',
  'Authorization Letter',
  'Other'
];

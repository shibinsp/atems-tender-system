import api from './api';

export const analyticsService = {
  getExecutiveDashboard: () => api.get('/analytics/executive-dashboard'),
  getTenderCycleAnalysis: () => api.get('/analytics/tender-cycle-analysis'),
  getVendorParticipation: () => api.get('/analytics/vendor-participation'),
  getCategorySpend: () => api.get('/analytics/category-spend'),
  getDepartmentPerformance: () => api.get('/analytics/department-performance'),
  getSavingsReport: () => api.get('/analytics/savings-report'),
  getCalendarEvents: (start?: string, end?: string) => 
    api.get(`/analytics/calendar-events${start ? `?start_date=${start}` : ''}${end ? `&end_date=${end}` : ''}`),
};

export const securityService = {
  get2FAStatus: () => api.get('/security/2fa/status'),
  enable2FA: (method: string) => api.post('/security/2fa/enable', { method }),
  verify2FA: (code: string) => api.post('/security/2fa/verify', { code }),
  disable2FA: (code: string) => api.post('/security/2fa/disable', { code }),
  getSessions: () => api.get('/security/sessions'),
  terminateSession: (id: number) => api.delete(`/security/sessions/${id}`),
  terminateAllSessions: () => api.delete('/security/sessions'),
  getAuditTrail: (params?: { entity_type?: string; limit?: number }) => 
    api.get('/security/audit-trail', { params }),
};

export const communicationsService = {
  getMessages: (folder: string = 'inbox') => api.get(`/communications/messages?folder=${folder}`),
  getMessage: (id: number) => api.get(`/communications/messages/${id}`),
  sendMessage: (data: { recipient_id: number; subject: string; content: string; tender_id?: number }) =>
    api.post('/communications/messages', data),
  getUnreadCount: () => api.get('/communications/messages/unread-count'),
  
  getTasks: (status?: string) => api.get(`/communications/tasks${status ? `?status=${status}` : ''}`),
  createTask: (data: { title: string; assigned_to: number; priority?: string; due_date?: string }) =>
    api.post('/communications/tasks', data),
  updateTaskStatus: (id: number, status: string) => api.put(`/communications/tasks/${id}/status?status=${status}`),
  
  getNotifications: (unreadOnly?: boolean) => 
    api.get(`/communications/notifications${unreadOnly ? '?unread_only=true' : ''}`),
  markNotificationRead: (id: number) => api.put(`/communications/notifications/${id}/read`),
  markAllRead: () => api.put('/communications/notifications/read-all'),
  
  getPreBidMeetings: (tenderId?: number) => 
    api.get(`/communications/prebid-meetings${tenderId ? `?tender_id=${tenderId}` : ''}`),
  createPreBidMeeting: (data: { tender_id: number; title: string; meeting_date: string; is_online?: boolean }) =>
    api.post('/communications/prebid-meetings', data),
};

export const vendorService = {
  register: (data: { company_name: string; email: string; phone: string; [key: string]: unknown }) =>
    api.post('/vendors/register', data),
  getRegistrations: (status?: string) => 
    api.get(`/vendors/registrations${status ? `?status=${status}` : ''}`),
  verifyVendor: (id: number, action: string, remarks?: string) =>
    api.put(`/vendors/registrations/${id}/verify?action=${action}${remarks ? `&remarks=${remarks}` : ''}`),
  getPerformance: (vendorId: number) => api.get(`/vendors/performance/${vendorId}`),
  addPerformanceReview: (data: { vendor_id: number; contract_id: number; quality_rating: number; delivery_rating: number; compliance_rating: number; communication_rating: number }) =>
    api.post('/vendors/performance', null, { params: data }),
};

export const integrationsService = {
  getWebhooks: () => api.get('/integrations/webhooks'),
  createWebhook: (data: { name: string; url: string; events: string[] }) =>
    api.post('/integrations/webhooks', data),
  deleteWebhook: (id: number) => api.delete(`/integrations/webhooks/${id}`),
  
  getAPIKeys: () => api.get('/integrations/api-keys'),
  createAPIKey: (name: string, permissions?: string[]) =>
    api.post(`/integrations/api-keys?name=${name}`, { permissions }),
  revokeAPIKey: (id: number) => api.delete(`/integrations/api-keys/${id}`),
  
  publishToGeM: (tenderId: number) => api.post(`/integrations/gem/publish/${tenderId}`),
  publishToCPPP: (tenderId: number) => api.post(`/integrations/cppp/publish/${tenderId}`),
  getSyncStatus: (tenderId: number) => api.get(`/integrations/sync-status/${tenderId}`),
};

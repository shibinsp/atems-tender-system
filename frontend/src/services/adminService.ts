import api from './api';
import type {
  User,
  UserCreate,
  UserUpdate,
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  Category,
  CategoryCreate,
  CategoryUpdate,
  SystemSettings,
  PaginatedResponse
} from '../types';

// Mock data for when backend is not available
const mockUsers: User[] = [
  { id: 1, email: 'admin@atems.gov.in', full_name: 'System Administrator', role: 'Admin', is_active: true, is_verified: true, created_at: '2025-01-01T00:00:00Z', last_login: '2025-12-28T10:00:00Z' },
  { id: 2, email: 'officer@atems.gov.in', full_name: 'Tender Officer', phone: '9876543210', role: 'Tender Officer', department_id: 1, is_active: true, is_verified: true, created_at: '2025-02-15T00:00:00Z', last_login: '2025-12-27T14:30:00Z' },
  { id: 3, email: 'evaluator@atems.gov.in', full_name: 'Senior Evaluator', role: 'Evaluator', department_id: 2, is_active: true, is_verified: true, created_at: '2025-03-10T00:00:00Z', last_login: '2025-12-26T09:15:00Z' },
  { id: 4, email: 'bidder@vendor.com', full_name: 'Vendor Corp Representative', phone: '9123456789', role: 'Bidder', is_active: true, is_verified: true, created_at: '2025-04-20T00:00:00Z', last_login: '2025-12-25T16:45:00Z' },
  { id: 5, email: 'viewer@atems.gov.in', full_name: 'Report Viewer', role: 'Viewer', department_id: 3, is_active: true, is_verified: false, created_at: '2025-05-05T00:00:00Z' },
  { id: 6, email: 'inactive@atems.gov.in', full_name: 'Inactive User', role: 'Tender Officer', department_id: 1, is_active: false, is_verified: true, created_at: '2025-01-15T00:00:00Z' }
];

const mockDepartments: Department[] = [
  { id: 1, name: 'IT Department', code: 'IT', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Public Works Department', code: 'PWD', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 3, name: 'Health Services', code: 'HEALTH', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 4, name: 'Education Department', code: 'EDU', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 5, name: 'Transport Department', code: 'TRANS', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 6, name: 'Finance Department', code: 'FIN', is_active: false, created_at: '2025-01-01T00:00:00Z' }
];

const mockCategories: Category[] = [
  { id: 1, name: 'Construction', code: 'CONST', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'IT Services', code: 'ITS', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 3, name: 'Medical Supplies', code: 'MED', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 4, name: 'Office Furniture', code: 'FURN', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 5, name: 'Vehicles', code: 'VEH', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 6, name: 'Consultancy', code: 'CONS', is_active: true, created_at: '2025-01-01T00:00:00Z' }
];

const mockSettings: SystemSettings = {
  site_name: 'ATEMS - AI Tender Evaluation System',
  default_currency: 'INR',
  date_format: 'DD/MM/YYYY',
  timezone: 'Asia/Kolkata',
  email_notifications: true,
  sms_notifications: false,
  auto_publish_rfp: false,
  min_bids_required: 3,
  emd_percentage: 2,
  performance_security_percentage: 10,
  max_file_size_mb: 25,
  allowed_file_types: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png']
};

export const adminService = {
  // User Management
  async getUsers(params?: { page?: number; role?: string; is_active?: boolean }): Promise<PaginatedResponse<User>> {
    try {
      const response = await api.get<User[]>('/admin/users', { params });
      // Backend returns array, wrap in paginated response
      const users = response.data;
      return {
        items: users,
        total: users.length,
        page: params?.page || 1,
        size: 100,
        pages: 1
      };
    } catch {
      // Return mock data
      let filtered = [...mockUsers];
      if (params?.role) {
        filtered = filtered.filter(u => u.role === params.role);
      }
      if (params?.is_active !== undefined) {
        filtered = filtered.filter(u => u.is_active === params.is_active);
      }
      return {
        items: filtered,
        total: filtered.length,
        page: params?.page || 1,
        size: 10,
        pages: Math.ceil(filtered.length / 10)
      };
    }
  },

  async getUser(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`/admin/users/${id}`);
      return response.data;
    } catch {
      const user = mockUsers.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    }
  },

  async createUser(data: UserCreate): Promise<User> {
    const response = await api.post<User>('/admin/users', data);
    return response.data;
  },

  async updateUser(id: number, data: UserUpdate): Promise<User> {
    const response = await api.put<User>(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async toggleUserStatus(id: number): Promise<User> {
    const response = await api.post<User>(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  async resetPassword(id: number): Promise<{ message: string; temp_password?: string }> {
    const response = await api.post(`/admin/users/${id}/reset-password`);
    return response.data;
  },

  // Department Management
  async getDepartments(includeInactive?: boolean): Promise<Department[]> {
    try {
      const response = await api.get<Department[]>('/admin/departments', {
        params: { include_inactive: includeInactive }
      });
      return response.data;
    } catch {
      return includeInactive ? mockDepartments : mockDepartments.filter(d => d.is_active);
    }
  },

  async getDepartment(id: number): Promise<Department> {
    try {
      const response = await api.get<Department>(`/admin/departments/${id}`);
      return response.data;
    } catch {
      const dept = mockDepartments.find(d => d.id === id);
      if (!dept) throw new Error('Department not found');
      return dept;
    }
  },

  async createDepartment(data: DepartmentCreate): Promise<Department> {
    const response = await api.post<Department>('/admin/departments', data);
    return response.data;
  },

  async updateDepartment(id: number, data: DepartmentUpdate): Promise<Department> {
    const response = await api.put<Department>(`/admin/departments/${id}`, data);
    return response.data;
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/admin/departments/${id}`);
  },

  // Category Management
  async getCategories(includeInactive?: boolean): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>('/admin/categories', {
        params: { include_inactive: includeInactive }
      });
      return response.data;
    } catch {
      return includeInactive ? mockCategories : mockCategories.filter(c => c.is_active);
    }
  },

  async getCategory(id: number): Promise<Category> {
    try {
      const response = await api.get<Category>(`/admin/categories/${id}`);
      return response.data;
    } catch {
      const cat = mockCategories.find(c => c.id === id);
      if (!cat) throw new Error('Category not found');
      return cat;
    }
  },

  async createCategory(data: CategoryCreate): Promise<Category> {
    const response = await api.post<Category>('/admin/categories', data);
    return response.data;
  },

  async updateCategory(id: number, data: CategoryUpdate): Promise<Category> {
    const response = await api.put<Category>(`/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },

  // System Settings
  async getSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get<SystemSettings>('/admin/settings');
      return response.data;
    } catch {
      return mockSettings;
    }
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await api.put<SystemSettings>('/admin/settings', data);
    return response.data;
  },

  // Dashboard Stats
  async getAdminStats(): Promise<{
    total_users: number;
    active_users: number;
    total_departments: number;
    total_categories: number;
    pending_verifications: number;
  }> {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch {
      return {
        total_users: mockUsers.length,
        active_users: mockUsers.filter(u => u.is_active).length,
        total_departments: mockDepartments.filter(d => d.is_active).length,
        total_categories: mockCategories.filter(c => c.is_active).length,
        pending_verifications: mockUsers.filter(u => !u.is_verified).length
      };
    }
  }
};

export default adminService;

import api from './api';
import type { User, AuthToken, LoginCredentials } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<AuthToken>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  async updateProfile(userData: {
    full_name?: string;
    phone?: string;
  }): Promise<User> {
    const response = await api.put<User>('/auth/profile', userData);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const response = await api.post<AuthToken>('/auth/refresh', null, {
      params: { refresh_token: refreshToken }
    });
    return response.data;
  }
};

export default authService;

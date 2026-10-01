import { apiClient } from './client';
import type { AuthResponse, User } from '@tebeya/shared';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient<User>('/users/me');
  },

  sendAdminOtp: async (email: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/admin/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyAdminOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },
};


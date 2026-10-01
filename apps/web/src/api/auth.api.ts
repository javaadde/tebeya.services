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
};

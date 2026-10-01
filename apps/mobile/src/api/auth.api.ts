import { AuthResponse, User } from '@tebeya/shared';
import { apiClient } from './client';

export interface VerifyInviteResult {
  code: string;
  lockedPhoneOrEmail?: string;
  expiresAt: string;
}

export interface RegisterPayload {
  inviteCode: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const authApi = {
  verifyInviteCode(code: string): Promise<VerifyInviteResult> {
    return apiClient<VerifyInviteResult>('/invites/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
      requiresAuth: false,
    });
  },

  register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      requiresAuth: false,
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    });
  },

  getProfile(): Promise<User> {
    return apiClient<User>('/auth/me', {
      method: 'GET',
      requiresAuth: true,
    });
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      requiresAuth: false,
    });
  },

  logout(): Promise<void> {
    return apiClient<void>('/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  },
};

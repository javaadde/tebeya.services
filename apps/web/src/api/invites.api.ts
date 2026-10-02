import { apiClient } from './client';
import type { InviteCode, InviteCodeStatus } from '@tebeya/shared';

export interface GenerateInvitesPayload {
  count?: number;
  expiresInMinutes?: number;
  expiresInHours?: number;
  lockedPhoneOrEmail?: string;
}

export const invitesApi = {
  list: async (status?: InviteCodeStatus): Promise<InviteCode[]> => {
    return apiClient<InviteCode[]>('/admin/invite-codes', {
      params: { status },
    });
  },

  generate: async (payload: GenerateInvitesPayload): Promise<InviteCode[]> => {
    return apiClient<InviteCode[]>('/admin/invite-codes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  revoke: async (id: string): Promise<InviteCode> => {
    return apiClient<InviteCode>(`/admin/invite-codes/${id}/revoke`, {
      method: 'POST',
    });
  },
};

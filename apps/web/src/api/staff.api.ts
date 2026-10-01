import { apiClient } from './client';
import type { User, UserStatus } from '@tebeya/shared';

export interface StaffListItem extends User {
  noShowCount?: number;
  completedCount?: number;
}

export interface StaffDetailResponse extends User {
  history?: Array<Record<string, unknown>>;
  noShowCount?: number;
  completedCount?: number;
}

export interface ListStaffParams {
  status?: UserStatus;
  search?: string;
}

export interface UpdateStaffStatusPayload {
  status?: UserStatus;
  phoneVerified?: boolean;
}

export const staffApi = {
  list: async (params?: ListStaffParams): Promise<StaffListItem[]> => {
    return apiClient<StaffListItem[]>('/admin/users', {
      params: params as Record<string, string | undefined>,
    });
  },

  getDetail: async (id: string): Promise<StaffDetailResponse> => {
    return apiClient<StaffDetailResponse>(`/admin/users/${id}`);
  },

  updateStatus: async (
    id: string,
    payload: UpdateStaffStatusPayload
  ): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

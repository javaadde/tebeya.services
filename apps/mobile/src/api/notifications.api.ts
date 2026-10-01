import { AppNotification } from '@tebeya/shared';
import { apiClient } from './client';

export const notificationsApi = {
  getNotifications(): Promise<AppNotification[]> {
    return apiClient<AppNotification[]>('/notifications', {
      method: 'GET',
    });
  },

  markAsRead(notificationId: string): Promise<void> {
    return apiClient<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead(): Promise<void> {
    return apiClient<void>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  registerFcmToken(token: string): Promise<void> {
    return apiClient<void>('/notifications/token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

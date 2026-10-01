import { apiClient } from './client';
import type { WageRule } from '@tebeya/shared';

export interface UpdateWageRulePayload {
  basePay?: number;
  freeKm?: number;
  perKmRate?: number;
}

export const wageApi = {
  getWageRule: async (): Promise<WageRule> => {
    return apiClient<WageRule>('/admin/payments/wage-rules');
  },

  updateWageRule: async (payload: UpdateWageRulePayload): Promise<WageRule> => {
    return apiClient<WageRule>('/admin/payments/wage-rules', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  markPaid: async (bookingIds: string[]): Promise<{ markedCount: number }> => {
    return apiClient<{ markedCount: number }>('/admin/payments/mark-paid', {
      method: 'POST',
      body: JSON.stringify({ bookingIds }),
    });
  },
};

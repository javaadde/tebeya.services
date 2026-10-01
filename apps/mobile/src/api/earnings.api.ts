import { EarningsSummary, Booking, CateringEvent } from '@tebeya/shared';
import { apiClient } from './client';

export interface EarningsHistoryItem {
  booking: Booking;
  event: CateringEvent;
}

export const earningsApi = {
  getSummary(): Promise<EarningsSummary> {
    return apiClient<EarningsSummary>('/earnings/summary', {
      method: 'GET',
    });
  },

  getHistory(month?: string): Promise<EarningsHistoryItem[]> {
    const qs = month ? `?month=${month}` : '';
    return apiClient<EarningsHistoryItem[]>(`/earnings/history${qs}`, {
      method: 'GET',
    });
  },
};

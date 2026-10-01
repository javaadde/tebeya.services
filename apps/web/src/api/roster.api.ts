import { apiClient } from './client';
import type { AttendanceStatus, RosterItem } from '@tebeya/shared';

export interface EventRosterResponse {
  eventId: string;
  headcount: number;
  filledCount: number;
  waitlistCount: number;
  roster: RosterItem[];
}

export interface MarkAttendanceItem {
  bookingId: string;
  attendance: AttendanceStatus;
}

export const rosterApi = {
  getRoster: async (eventId: string): Promise<EventRosterResponse> => {
    return apiClient<EventRosterResponse>(`/admin/events/${eventId}/roster`);
  },

  markAttendance: async (
    eventId: string,
    attendees: MarkAttendanceItem[]
  ): Promise<{ updatedCount: number }> => {
    return apiClient<{ updatedCount: number }>(`/admin/events/${eventId}/roster/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ attendees }),
    });
  },

  getExportCsvUrl: (eventId: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return `${base}/admin/events/${eventId}/roster/export`;
  },
};

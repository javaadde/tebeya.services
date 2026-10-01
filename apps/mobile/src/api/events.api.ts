import { CateringEvent, EventWithStaffMeta, Booking } from '@tebeya/shared';
import { apiClient } from './client';

export interface GetEventsParams {
  slot?: string;
  date?: string;
}

export interface JoinEventPayload {
  acknowledgedDoubleBooking?: boolean;
}

export const eventsApi = {
  getEvents(params?: GetEventsParams): Promise<EventWithStaffMeta[]> {
    const query = new URLSearchParams();
    if (params?.slot && params.slot !== 'all') {
      query.set('slot', params.slot);
    }
    if (params?.date) {
      query.set('date', params.date);
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient<EventWithStaffMeta[]>(`/events${qs}`, {
      method: 'GET',
    });
  },

  getEventById(id: string): Promise<EventWithStaffMeta> {
    return apiClient<EventWithStaffMeta>(`/events/${id}`, {
      method: 'GET',
    });
  },

  getMyBookings(): Promise<{ bookings: Booking[]; events: CateringEvent[] }> {
    return apiClient<{ bookings: Booking[]; events: CateringEvent[] }>('/bookings/my', {
      method: 'GET',
    });
  },

  joinEvent(eventId: string, payload: JoinEventPayload = {}): Promise<Booking> {
    return apiClient<Booking>(`/events/${eventId}/join`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  leaveEvent(eventId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/events/${eventId}/leave`, {
      method: 'POST',
    });
  },
};

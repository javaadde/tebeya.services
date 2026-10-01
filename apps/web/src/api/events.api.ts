import { apiClient } from './client';
import type { CateringEvent, EventSlot, EventVenue } from '@tebeya/shared';

export interface CreateEventPayload {
  title: string;
  imageUrl?: string;
  date: string;
  startTime: string;
  endTime: string;
  slot: EventSlot;
  venue: EventVenue;
  headcount: number;
  payPerPerson: number;
  notes?: string;
  dressCode?: string;
  contactPerson?: {
    name: string;
    phone: string;
  };
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface ListEventsParams {
  date?: string;
  slot?: EventSlot;
  onlyOpen?: 'true' | 'false';
}

export const eventsApi = {
  list: async (params?: ListEventsParams): Promise<CateringEvent[]> => {
    return apiClient<CateringEvent[]>('/events', {
      params: params as Record<string, string | undefined>,
    });
  },

  getById: async (id: string): Promise<CateringEvent> => {
    return apiClient<CateringEvent>(`/events/${id}`);
  },

  create: async (payload: CreateEventPayload): Promise<CateringEvent> => {
    return apiClient<CateringEvent>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: UpdateEventPayload): Promise<CateringEvent> => {
    return apiClient<CateringEvent>(`/admin/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  publish: async (id: string): Promise<CateringEvent> => {
    return apiClient<CateringEvent>(`/admin/events/${id}/publish`, {
      method: 'POST',
    });
  },

  cancel: async (id: string): Promise<CateringEvent> => {
    return apiClient<CateringEvent>(`/admin/events/${id}/cancel`, {
      method: 'POST',
    });
  },
};

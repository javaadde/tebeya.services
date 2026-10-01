import { EventSlot } from '@tebeya/shared';

export const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  COMPANY_NAME: 'Tebeya Services',
  DEFAULT_FREE_KM: 10,
  DEFAULT_PER_KM_RATE: 15,
  CANCELLATION_CUTOFF_HOURS: 24,
  MIN_TRAVEL_GAP_MINUTES: 120, // 2 hours
  MAX_EVENTS_PER_DAY: 2,
};

export const SLOT_INFO: Record<EventSlot, { label: string; badgeClass: string; textClass: string }> = {
  breakfast: {
    label: 'Breakfast',
    badgeClass: 'bg-amber-100 border-amber-200',
    textClass: 'text-amber-800',
  },
  lunch: {
    label: 'Lunch',
    badgeClass: 'bg-blue-100 border-blue-200',
    textClass: 'text-blue-800',
  },
  snacks: {
    label: 'High Tea / Snacks',
    badgeClass: 'bg-emerald-100 border-emerald-200',
    textClass: 'text-emerald-800',
  },
  dinner: {
    label: 'Dinner',
    badgeClass: 'bg-purple-100 border-purple-200',
    textClass: 'text-purple-800',
  },
  custom: {
    label: 'Custom Shift',
    badgeClass: 'bg-slate-100 border-slate-200',
    textClass: 'text-slate-800',
  },
};

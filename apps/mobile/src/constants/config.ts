import { EventSlot } from '@tebeya/shared';
import Constants from 'expo-constants';

function getApiBaseUrl(): string {
  let base = process.env.EXPO_PUBLIC_API_URL;
  if (base) {
    base = base.trim().replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  // Automatically extract computer's local network IP from Expo Metro host
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:5000/api`;
  }
  return 'http://192.168.1.4:5000/api';
}

export const CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  COMPANY_NAME: 'Tebeya Services',
  DEFAULT_FREE_KM: 10,
  DEFAULT_PER_KM_RATE: 15,
  CANCELLATION_CUTOFF_HOURS: 24,
  MIN_TRAVEL_GAP_MINUTES: 120, // 2 hours
  MAX_EVENTS_PER_DAY: 1,
};

export const SLOT_INFO: Record<EventSlot, { label: string; badgeClass: string; textClass: string }> = {
  breakfast: {
    label: 'Breakfast',
    badgeClass: 'bg-[#f1f2f2] border-neutral-200/80',
    textClass: 'text-neutral-800',
  },
  lunch: {
    label: 'Lunch',
    badgeClass: 'bg-[#f1f2f2] border-neutral-200/80',
    textClass: 'text-neutral-800',
  },
  snacks: {
    label: 'Snacks',
    badgeClass: 'bg-[#f1f2f2] border-neutral-200/80',
    textClass: 'text-neutral-800',
  },
  dinner: {
    label: 'Dinner',
    badgeClass: 'bg-[#fdece8] border-[#fad4cc]',
    textClass: 'text-[#df3b20]',
  },
  custom: {
    label: 'Custom Shift',
    badgeClass: 'bg-[#f1f2f2] border-neutral-200/80',
    textClass: 'text-neutral-800',
  },
};

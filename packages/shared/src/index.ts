export * from './types/index.js';

export const APP_CONFIG = {
  MAX_DAILY_EVENTS: 2,
  MIN_HOURS_BETWEEN_EVENTS: 2,
  INVITE_CODE_EXPIRY_HOURS: 48,
  DEFAULT_LEAVE_CUTOFF_HOURS: 24,
} as const;

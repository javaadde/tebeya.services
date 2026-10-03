import { CateringEvent } from '@tebeya/shared';
import { CONFIG } from '../constants/config';

export interface ClashCheckResult {
  canJoin: boolean;
  reason?: 'OVERLAP' | 'DAILY_LIMIT_EXCEEDED' | 'INSUFFICIENT_TRAVEL_GAP';
  conflictingEvent?: CateringEvent;
  isSecondShiftOfDay: boolean;
  message?: string;
}

/**
 * Converts a time string "HH:mm" to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Pre-checks whether a target event clashes with any already joined events.
 * Follows Rule 2:
 * 1. Hard overlap: startA < endB && startB < endA
 * 2. Daily limit: Max 2 events per calendar day
 * 3. Minimum travel gap: 2 hours (120 minutes) between events on the same day
 */
export function evaluateScheduleClash(
  targetEvent: CateringEvent,
  joinedEvents: CateringEvent[]
): ClashCheckResult {
  // Filter confirmed events on the exact same calendar date (YYYY-MM-DD)
  const sameDayEvents = joinedEvents.filter(
    (e) => e.date === targetEvent.date && e.id !== targetEvent.id
  );

  // 1. Daily Cap Check
  if (sameDayEvents.length >= CONFIG.MAX_EVENTS_PER_DAY) {
    return {
      canJoin: false,
      reason: 'DAILY_LIMIT_EXCEEDED',
      isSecondShiftOfDay: false,
      message: 'You can only take one work per day. You already have a confirmed shift on this date.',
    };
  }

  const targetStart = timeToMinutes(targetEvent.startTime);
  const targetEnd = timeToMinutes(targetEvent.endTime);

  for (const existing of sameDayEvents) {
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);

    // 2. Hard Overlap Rule: startA < endB && startB < endA
    const hasOverlap = targetStart < existingEnd && existingStart < targetEnd;
    if (hasOverlap) {
      return {
        canJoin: false,
        reason: 'OVERLAP',
        conflictingEvent: existing,
        isSecondShiftOfDay: false,
        message: `This event overlaps with "${existing.title}" (${existing.startTime} - ${existing.endTime}).`,
      };
    }

    // 3. Minimum Travel Gap Rule (120 minutes buffer)
    let gapMinutes: number;
    if (targetStart >= existingEnd) {
      gapMinutes = targetStart - existingEnd;
    } else {
      gapMinutes = existingStart - targetEnd;
    }

    if (gapMinutes < CONFIG.MIN_TRAVEL_GAP_MINUTES) {
      return {
        canJoin: false,
        reason: 'INSUFFICIENT_TRAVEL_GAP',
        conflictingEvent: existing,
        isSecondShiftOfDay: false,
        message: `Minimum ${CONFIG.MIN_TRAVEL_GAP_MINUTES / 60} hours travel buffer required between shifts. Currently only ${gapMinutes} minutes available.`,
      };
    }
  }

  // If there is already 1 confirmed shift today, this will be the 2nd shift
  const isSecondShiftOfDay = sameDayEvents.length === 1;

  return {
    canJoin: true,
    isSecondShiftOfDay,
  };
}

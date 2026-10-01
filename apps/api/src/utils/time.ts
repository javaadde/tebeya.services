/**
 * Converts "HH:mm" 24h time string into minutes from midnight (0 to 1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid time format: "${timeStr}". Expected HH:mm`);
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Checks if two open-interval time windows overlap on the same calendar day.
 * Two events [startA, endA] and [startB, endB] overlap iff:
 * startA < endB && startB < endA
 */
export function doIntervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);

  return aStart < bEnd && bStart < aEnd;
}

/**
 * Returns travel gap in minutes between two non-overlapping intervals on the same day.
 * Returns 0 if they overlap.
 */
export function getGapInMinutes(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): number {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);

  if (aStart < bEnd && bStart < aEnd) {
    return 0; // Overlapping
  }

  if (aEnd <= bStart) {
    return bStart - aEnd;
  }

  if (bEnd <= aStart) {
    return aStart - bEnd;
  }

  return 0;
}

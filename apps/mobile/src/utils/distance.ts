import { WageRule } from '@tebeya/shared';
import { CONFIG } from '../constants/config';

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes the travel allowance based on distance and company wage rules.
 * e.g., If distance is 15 km and freeKm is 10, then billable km is 5 km.
 * Allowance = 5 * perKmRate.
 */
export function calculateTravelAllowance(
  distanceKm: number,
  wageRule?: WageRule | null
): number {
  const freeKm = wageRule?.freeKm ?? CONFIG.DEFAULT_FREE_KM;
  const perKmRate = wageRule?.perKmRate ?? CONFIG.DEFAULT_PER_KM_RATE;

  if (distanceKm <= freeKm) {
    return 0;
  }

  const extraKm = distanceKm - freeKm;
  return Math.round(extraKm * perKmRate);
}

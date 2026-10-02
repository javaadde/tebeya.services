import type { CateringEvent, InviteCode, WageRule } from '@tebeya/shared';
import type { StaffListItem } from './staff.api';
import type { EventRosterResponse } from './roster.api';

export const mockWageRule: WageRule = {
  id: 'wage_rule_default',
  basePay: 800,
  freeKm: 15,
  perKmRate: 10,
  updatedAt: new Date().toISOString(),
};

export const mockEvents: CateringEvent[] = [];
export const mockStaff: StaffListItem[] = [];
export const mockInvites: InviteCode[] = [];
export const mockRosters: Record<string, EventRosterResponse> = {};

export type UserRole = 'staff' | 'admin';

export type UserStatus = 'pending_verification' | 'active' | 'suspended';

export interface UserAddress {
  text: string;
  lat?: number;
  lng?: number;
  confirmed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  role: UserRole;
  status: UserStatus;
  profileImageUrl?: string;
  idProofUrl?: string;
  address?: UserAddress;
  fcmTokens?: string[];
  createdAt: string;
  updatedAt: string;
}

export type InviteCodeStatus = 'active' | 'used' | 'expired' | 'revoked';

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  lockedPhoneOrEmail?: string;
  expiresAt: string;
  usedBy?: string;
  usedAt?: string;
  status: InviteCodeStatus;
  createdAt: string;
}

export type EventSlot = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'custom';

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface EventVenue {
  text: string;
  lat?: number;
  lng?: number;
}

export interface CateringEvent {
  id: string;
  title: string;
  imageUrl?: string;
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slot: EventSlot;
  venue: EventVenue;
  headcount: number;
  filledCount: number;
  payPerPerson: number;
  status: EventStatus;
  notes?: string;
  dressCode?: string;
  contactPerson?: {
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export type AttendanceStatus = 'pending' | 'present' | 'absent' | 'late';

export type PayoutStatus = 'pending' | 'paid';

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  attendance: AttendanceStatus;
  acknowledgedDoubleBooking: boolean;
  payoutAmount: number;
  payoutStatus: PayoutStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WageRule {
  id: string;
  basePay: number;
  freeKm: number;
  perKmRate: number;
  updatedAt: string;
}

export type NotificationType =
  | 'event_published'
  | 'event_updated'
  | 'event_cancelled'
  | 'seat_opened'
  | 'event_reminder'
  | 'account_verified'
  | 'payment_marked';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

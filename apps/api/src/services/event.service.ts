import { CateringEvent, ICateringEventDocument } from '../models/event.model.js';
import { Booking } from '../models/booking.model.js';
import { User } from '../models/user.model.js';
import { WageRule } from '../models/wage-rule.model.js';
import { AppError } from '../utils/errors.js';
import { calculateDistanceKm } from '../utils/geo.js';
import { EventSlot, EventStatus, EventWithStaffMeta } from '@tebeya/shared';

export class EventService {
  static async listEventsForAdmin(filters?: {
    date?: string;
    slot?: EventSlot;
    status?: EventStatus;
    onlyOpen?: boolean;
  }): Promise<EventWithStaffMeta[]> {
    const query: any = {};
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.date) {
      query.date = filters.date;
    }
    if (filters?.slot) {
      query.slot = filters.slot;
    }

    let events = await CateringEvent.find(query).sort({ date: -1, startTime: 1 });

    if (filters?.onlyOpen) {
      events = events.filter((e) => e.filledCount < e.headcount);
    }

    return events.map((event) => {
      const eventJson = event.toSafeJSON() as any;
      return {
        ...eventJson,
        estimatedPayout: event.payPerPerson,
      };
    });
  }

  static async listEventsForStaff(
    userId?: string,
    filters?: { date?: string; slot?: EventSlot; onlyOpen?: boolean }
  ): Promise<EventWithStaffMeta[]> {
    const today = new Date().toISOString().split('T')[0];
    const query: any = {
      status: 'published',
      date: { $gte: today },
    };

    if (filters?.date) {
      query.date = filters.date;
    }
    if (filters?.slot) {
      query.slot = filters.slot;
    }

    let events = await CateringEvent.find(query).sort({ date: 1, startTime: 1 });

    if (filters?.onlyOpen) {
      events = events.filter((e) => e.filledCount < e.headcount);
    }

    let userBookingsMap: Map<string, string> = new Map();
    let userAddress: { lat?: number; lng?: number } | undefined;
    let wageRule: { freeKm: number; perKmRate: number } = { freeKm: 15, perKmRate: 10 };

    if (userId) {
      const user = await User.findById(userId);
      if (user?.address?.lat && user?.address?.lng) {
        userAddress = { lat: user.address.lat, lng: user.address.lng };
      }

      const dbWageRule = await WageRule.findOne();
      if (dbWageRule) {
        wageRule = { freeKm: dbWageRule.freeKm, perKmRate: dbWageRule.perKmRate };
      }

      const bookings = await Booking.find({
        userId,
        eventId: { $in: events.map((e) => e._id) },
        status: { $in: ['confirmed', 'waitlisted'] },
      });

      for (const b of bookings) {
        userBookingsMap.set(b.eventId.toString(), b.status);
      }
    }

    return events.map((event) => {
      const eventJson = event.toSafeJSON() as any;
      const myBookingStatus = userBookingsMap.get(event._id.toString()) as any;

      let distanceKm: number | undefined;
      let estimatedPayout = event.payPerPerson;

      if (userAddress?.lat && userAddress?.lng && event.venue.lat && event.venue.lng) {
        distanceKm = calculateDistanceKm(
          userAddress.lat,
          userAddress.lng,
          event.venue.lat,
          event.venue.lng
        );
        const extraKm = Math.max(0, distanceKm - wageRule.freeKm);
        estimatedPayout += extraKm * wageRule.perKmRate;
      }

      return {
        ...eventJson,
        distanceKm,
        estimatedPayout,
        isJoined: myBookingStatus === 'confirmed',
        myBookingStatus,
      };
    });
  }

  static async getEventById(id: string, userId?: string): Promise<EventWithStaffMeta> {
    const event = await CateringEvent.findById(id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }

    const eventJson = event.toSafeJSON() as any;
    let myBookingStatus: any;

    if (userId) {
      const booking = await Booking.findOne({ userId, eventId: id });
      if (booking) {
        myBookingStatus = booking.status;
      }
    }

    return {
      ...eventJson,
      isJoined: myBookingStatus === 'confirmed',
      myBookingStatus,
    };
  }

  static async createEvent(data: {
    title: string;
    imageUrl?: string;
    date: string;
    startTime: string;
    endTime: string;
    slot: EventSlot;
    venue: { text: string; lat?: number; lng?: number };
    headcount: number;
    payPerPerson: number;
    status?: EventStatus;
    notes?: string;
    dressCode?: string;
    contactPerson?: { name: string; phone: string };
  }): Promise<ICateringEventDocument> {
    const status = data.status || 'draft';
    return CateringEvent.create({
      ...data,
      filledCount: 0,
      status,
    });
  }

  static async updateEvent(
    id: string,
    updates: Partial<{
      title: string;
      imageUrl?: string;
      date: string;
      startTime: string;
      endTime: string;
      slot: EventSlot;
      venue: { text: string; lat?: number; lng?: number };
      headcount: number;
      payPerPerson: number;
      notes?: string;
      dressCode?: string;
      contactPerson?: { name: string; phone: string };
    }>
  ): Promise<ICateringEventDocument> {
    const event = await CateringEvent.findByIdAndUpdate(id, updates, { new: true });
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }
    return event;
  }

  static async publishEvent(id: string): Promise<ICateringEventDocument> {
    const event = await CateringEvent.findById(id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }
    event.status = 'published';
    return event.save();
  }

  static async cancelEvent(id: string): Promise<ICateringEventDocument> {
    const event = await CateringEvent.findById(id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }
    event.status = 'cancelled';
    await event.save();

    // Mark all active bookings cancelled
    await Booking.updateMany(
      { eventId: id, status: { $in: ['confirmed', 'waitlisted'] } },
      { status: 'cancelled' }
    );

    return event;
  }
}

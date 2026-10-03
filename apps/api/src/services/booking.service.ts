import mongoose from 'mongoose';
import { Booking, IBookingDocument } from '../models/booking.model.js';
import { CateringEvent, ICateringEventDocument } from '../models/event.model.js';
import { User } from '../models/user.model.js';
import { WageRule } from '../models/wage-rule.model.js';
import { AppError } from '../utils/errors.js';
import { doIntervalsOverlap, getGapInMinutes } from '../utils/time.js';
import { calculateDistanceKm } from '../utils/geo.js';
import { APP_CONFIG } from '@tebeya/shared';

export class BookingService {
  static async joinEvent(
    userId: string,
    eventId: string,
    acknowledgedDoubleBooking: boolean
  ): Promise<{ booking: IBookingDocument; status: 'confirmed' | 'waitlisted' }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    if (user.status !== 'active') {
      throw new AppError(
        'ACCOUNT_NOT_ACTIVE',
        'Your account must be verified and active to join events',
        403
      );
    }

    const targetEvent = await CateringEvent.findById(eventId);
    if (!targetEvent || targetEvent.status !== 'published') {
      throw new AppError('EVENT_NOT_AVAILABLE', 'Event is not available for booking', 404);
    }

    // Check if user already booked this event
    const existingBooking = await Booking.findOne({ userId, eventId });
    if (existingBooking) {
      if (existingBooking.status === 'confirmed') {
        throw new AppError('ALREADY_JOINED', 'You have already joined this event', 409);
      }
      if (existingBooking.status === 'waitlisted') {
        throw new AppError('ALREADY_WAITLISTED', 'You are already on the waitlist for this event', 409);
      }
    }

    // 1. Fetch user's existing confirmed bookings on the same calendar date
    const sameDayConfirmedBookings = await Booking.find({
      userId,
      status: 'confirmed',
    }).populate<{ eventId: ICateringEventDocument }>('eventId');

    const confirmedEventsSameDay = sameDayConfirmedBookings
      .map((b) => b.eventId)
      .filter((ev) => ev && ev.date === targetEvent.date && ev.status !== 'cancelled');

    // 2. Check Daily Limit
    if (confirmedEventsSameDay.length >= APP_CONFIG.MAX_DAILY_EVENTS) {
      throw new AppError(
        'DAILY_EVENT_LIMIT_EXCEEDED',
        'You can only take one work per day. You already have a confirmed shift on this date.',
        409
      );
    }

    // 3. Check Hard Clash & Travel Gap
    const minGapMinutes = APP_CONFIG.MIN_HOURS_BETWEEN_EVENTS * 60;

    for (const existing of confirmedEventsSameDay) {
      const hasClash = doIntervalsOverlap(
        targetEvent.startTime,
        targetEvent.endTime,
        existing.startTime,
        existing.endTime
      );

      if (hasClash) {
        throw new AppError(
          'SCHEDULE_CLASH',
          `Schedule conflict: overlaps with confirmed event "${existing.title}" (${existing.startTime} - ${existing.endTime})`,
          409
        );
      }

      const gapMinutes = getGapInMinutes(
        targetEvent.startTime,
        targetEvent.endTime,
        existing.startTime,
        existing.endTime
      );

      if (gapMinutes < minGapMinutes) {
        throw new AppError(
          'INSUFFICIENT_TRAVEL_GAP',
          `Insufficient travel gap: A minimum of ${APP_CONFIG.MIN_HOURS_BETWEEN_EVENTS} hours gap is required between shifts on the same day. Current gap is ${gapMinutes} minutes.`,
          409
        );
      }
    }

    // 4. Double Booking Acknowledgment
    if (confirmedEventsSameDay.length === 1 && !acknowledgedDoubleBooking) {
      throw new AppError(
        'DOUBLE_BOOKING_ACKNOWLEDGEMENT_REQUIRED',
        'You have taken two events today. You must confirm and acknowledge that you will be present at both.',
        400
      );
    }

    // 5. Calculate estimated payout based on wage rule and distance
    let estimatedPayout = targetEvent.payPerPerson;
    if (user.address?.lat && user.address?.lng && targetEvent.venue.lat && targetEvent.venue.lng) {
      const wageRule = await WageRule.findOne();
      const freeKm = wageRule?.freeKm ?? 15;
      const perKmRate = wageRule?.perKmRate ?? 10;
      const distance = calculateDistanceKm(
        user.address.lat,
        user.address.lng,
        targetEvent.venue.lat,
        targetEvent.venue.lng
      );
      const extraKm = Math.max(0, distance - freeKm);
      estimatedPayout += extraKm * perKmRate;
    }

    // 6. Atomic Seat Allocation
    const allocatedEvent = await CateringEvent.findOneAndUpdate(
      {
        _id: targetEvent._id,
        status: 'published',
        $expr: { $lt: ['$filledCount', '$headcount'] },
      },
      {
        $inc: { filledCount: 1 },
      },
      { new: true }
    );

    const bookingStatus: 'confirmed' | 'waitlisted' = allocatedEvent ? 'confirmed' : 'waitlisted';

    let booking: IBookingDocument;
    if (existingBooking) {
      existingBooking.status = bookingStatus;
      existingBooking.acknowledgedDoubleBooking = acknowledgedDoubleBooking;
      existingBooking.payoutAmount = estimatedPayout;
      booking = await existingBooking.save();
    } else {
      booking = await Booking.create({
        userId,
        eventId: targetEvent._id,
        status: bookingStatus,
        attendance: 'pending',
        acknowledgedDoubleBooking,
        payoutAmount: estimatedPayout,
        payoutStatus: 'pending',
      });
    }

    return { booking, status: bookingStatus };
  }

  static async leaveEvent(
    userId: string,
    bookingId: string
  ): Promise<{ message: string; promotedWaitlistUser?: string }> {
    const booking = await Booking.findOne({ _id: bookingId, userId }).populate<{
      eventId: ICateringEventDocument;
    }>('eventId');

    if (!booking) {
      throw new AppError('BOOKING_NOT_FOUND', 'Booking not found', 404);
    }

    if (booking.status === 'cancelled') {
      throw new AppError('ALREADY_CANCELLED', 'This booking has already been cancelled', 400);
    }

    const event = booking.eventId;
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Associated event not found', 404);
    }

    // Check cancellation cutoff time (24h before event date + startTime)
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const eventStart = new Date(event.date);
    eventStart.setHours(hours, minutes, 0, 0);

    const cutoffMs = APP_CONFIG.DEFAULT_LEAVE_CUTOFF_HOURS * 60 * 60 * 1000;
    const now = new Date();

    if (eventStart.getTime() - now.getTime() < cutoffMs) {
      throw new AppError(
        'CANCELLATION_CUTOFF_EXCEEDED',
        `Cannot leave within ${APP_CONFIG.DEFAULT_LEAVE_CUTOFF_HOURS} hours of event start. Please contact an administrator.`,
        403
      );
    }

    const wasConfirmed = booking.status === 'confirmed';
    booking.status = 'cancelled';
    await booking.save();

    let promotedUserId: string | undefined;

    if (wasConfirmed) {
      // Free seat
      await CateringEvent.findByIdAndUpdate(event._id, {
        $inc: { filledCount: -1 },
      });

      // Check waitlist (FIFO)
      const waitlisted = await Booking.findOne({
        eventId: event._id,
        status: 'waitlisted',
      }).sort({ createdAt: 1 });

      if (waitlisted) {
        // Promote waitlisted user
        const allocated = await CateringEvent.findOneAndUpdate(
          {
            _id: event._id,
            $expr: { $lt: ['$filledCount', '$headcount'] },
          },
          {
            $inc: { filledCount: 1 },
          },
          { new: true }
        );

        if (allocated) {
          waitlisted.status = 'confirmed';
          await waitlisted.save();
          promotedUserId = waitlisted.userId.toString();
        }
      }
    }

    return {
      message: 'Booking cancelled successfully',
      promotedWaitlistUser: promotedUserId,
    };
  }

  static async getMyBookings(
    userId: string,
    filter?: { type?: 'upcoming' | 'history'; month?: string }
  ): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    const query: any = { userId };

    const bookings = await Booking.find(query)
      .populate<{ eventId: ICateringEventDocument }>('eventId')
      .sort({ createdAt: -1 });

    return bookings
      .filter((b) => b.eventId)
      .filter((b) => {
        if (filter?.type === 'upcoming') {
          return b.eventId.date >= today && b.status !== 'cancelled';
        }
        if (filter?.type === 'history') {
          return b.eventId.date < today || b.status === 'cancelled';
        }
        return true;
      })
      .filter((b) => {
        if (filter?.month) {
          return b.eventId.date.startsWith(filter.month);
        }
        return true;
      })
      .map((b) => ({
        id: b._id.toString(),
        event: b.eventId.toSafeJSON(),
        status: b.status,
        attendance: b.attendance,
        payoutAmount: b.payoutAmount,
        payoutStatus: b.payoutStatus,
        createdAt: b.createdAt.toISOString(),
      }));
  }
}

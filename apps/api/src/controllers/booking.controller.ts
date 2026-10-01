import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/response.js';

export class BookingController {
  static async joinEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { eventId, acknowledgedDoubleBooking } = req.body;

      const result = await BookingService.joinEvent(
        userId,
        eventId,
        acknowledgedDoubleBooking
      );

      sendSuccess(
        res,
        {
          booking: result.booking.toSafeJSON(),
          status: result.status,
        },
        201,
        result.status === 'confirmed'
          ? 'Event joined successfully'
          : 'Event is full; added to waitlist'
      );
    } catch (err) {
      next(err);
    }
  }

  static async leaveEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const bookingId = req.params.id;

      const result = await BookingService.leaveEvent(userId, bookingId);
      sendSuccess(res, result, 200, result.message);
    } catch (err) {
      next(err);
    }
  }

  static async getMyBookings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { type, month } = req.query as { type?: 'upcoming' | 'history'; month?: string };

      const bookings = await BookingService.getMyBookings(userId, { type, month });
      sendSuccess(res, bookings, 200);
    } catch (err) {
      next(err);
    }
  }
}

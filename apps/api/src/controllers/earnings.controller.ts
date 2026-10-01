import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { BookingService } from '../services/booking.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/response.js';

export class EarningsController {
  static async getSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const summary = await PaymentService.getEarningsSummary(req.user!.userId);
      sendSuccess(res, summary, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { month } = req.query as { month?: string };
      const history = await BookingService.getMyBookings(req.user!.userId, {
        type: 'history',
        month,
      });
      sendSuccess(res, history, 200);
    } catch (err) {
      next(err);
    }
  }
}

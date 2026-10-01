import { Response, NextFunction } from 'express';
import { PaymentService } from '../../services/payment.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminPaymentController {
  static async markPaid(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PaymentService.markBookingsPaid(req.body.bookingIds);
      sendSuccess(res, result, 200, `${result.markedCount} booking(s) marked as paid`);
    } catch (err) {
      next(err);
    }
  }

  static async getWageRule(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rule = await PaymentService.getWageRule();
      sendSuccess(res, rule, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateWageRule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await PaymentService.updateWageRule(req.body);
      sendSuccess(res, updated, 200, 'Wage rule updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

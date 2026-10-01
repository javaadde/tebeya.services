import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/response.js';

export class NotificationController {
  static async registerToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await NotificationService.registerFcmToken(req.user!.userId, req.body.token);
      sendSuccess(res, { registered: true }, 200, 'FCM token registered');
    } catch (err) {
      next(err);
    }
  }

  static async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await NotificationService.getNotifications(
        req.user!.userId,
        unreadOnly
      );
      sendSuccess(res, notifications, 200);
    } catch (err) {
      next(err);
    }
  }

  static async markRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await NotificationService.markAsRead(req.params.id, req.user!.userId);
      sendSuccess(res, updated, 200, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }
}

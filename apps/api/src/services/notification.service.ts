import { User } from '../models/user.model.js';
import { Notification, INotificationDocument } from '../models/notification.model.js';
import { NotificationType } from '@tebeya/shared';
import { AppError } from '../utils/errors.js';

export class NotificationService {
  static async registerFcmToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
  }

  static async getNotifications(
    userId: string,
    unreadOnly = false
  ): Promise<Record<string, unknown>[]> {
    const query: any = { userId };
    if (unreadOnly) {
      query.readAt = null;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    return notifications.map((n) => n.toSafeJSON());
  }

  static async markAsRead(notificationId: string, userId: string): Promise<Record<string, unknown>> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      throw new AppError('NOTIFICATION_NOT_FOUND', 'Notification not found', 404);
    }
    return notification.toSafeJSON();
  }

  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<INotificationDocument> {
    return Notification.create({
      userId,
      type,
      title,
      body,
      data,
    });
  }
}

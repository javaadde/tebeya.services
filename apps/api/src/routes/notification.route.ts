import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const notificationRouter = Router();

notificationRouter.use(authMiddleware);

notificationRouter.post('/fcm-token', NotificationController.registerToken);
notificationRouter.get('/', NotificationController.getNotifications);
notificationRouter.patch('/:id/read', NotificationController.markRead);

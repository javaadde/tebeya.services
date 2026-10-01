import { Router } from 'express';
import { healthRouter } from './health.route.js';
import { authRouter } from './auth.route.js';
import { eventRouter } from './event.route.js';
import { bookingRouter } from './booking.route.js';
import { userRouter } from './user.route.js';
import { notificationRouter } from './notification.route.js';
import { earningsRouter } from './earnings.route.js';
import { adminInviteRouter } from './admin/invite.route.js';
import { adminUserRouter } from './admin/user.route.js';
import { adminEventRouter } from './admin/event.route.js';
import { adminRosterRouter } from './admin/roster.route.js';
import { adminPaymentRouter } from './admin/payment.route.js';

export const apiRouter = Router();

// Public / Health
apiRouter.use('/health', healthRouter);

// Staff / Common Auth
apiRouter.use('/auth', authRouter);
apiRouter.use('/events', eventRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/earnings', earningsRouter);

// Admin Routes
apiRouter.use('/admin/invite-codes', adminInviteRouter);
apiRouter.use('/admin/users', adminUserRouter);
apiRouter.use('/admin/events', adminEventRouter);
apiRouter.use('/admin/events', adminRosterRouter);
apiRouter.use('/admin/payments', adminPaymentRouter);

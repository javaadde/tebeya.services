import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import {
  joinEventSchema,
  leaveEventSchema,
  myBookingsQuerySchema,
} from '../schemas/booking.schema.js';

export const bookingRouter = Router();

bookingRouter.use(authMiddleware);

bookingRouter.post('/join', validateBody(joinEventSchema), BookingController.joinEvent);
bookingRouter.post('/:id/leave', validateBody(leaveEventSchema), BookingController.leaveEvent);
bookingRouter.get('/my-bookings', validateQuery(myBookingsQuerySchema), BookingController.getMyBookings);

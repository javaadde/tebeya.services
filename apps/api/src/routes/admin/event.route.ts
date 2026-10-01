import { Router } from 'express';
import { AdminEventController } from '../../controllers/admin/event.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createEventSchema, updateEventSchema } from '../../schemas/event.schema.js';

export const adminEventRouter = Router();

adminEventRouter.use(authMiddleware, requireRole('admin'));

adminEventRouter.post('/', validateBody(createEventSchema), AdminEventController.createEvent);
adminEventRouter.patch('/:id', validateBody(updateEventSchema), AdminEventController.updateEvent);
adminEventRouter.post('/:id/publish', AdminEventController.publishEvent);
adminEventRouter.post('/:id/cancel', AdminEventController.cancelEvent);

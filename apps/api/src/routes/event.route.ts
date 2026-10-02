import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { listEventsQuerySchema } from '../schemas/event.schema.js';

export const eventRouter = Router();

eventRouter.get('/', optionalAuthMiddleware, validateQuery(listEventsQuerySchema), EventController.listEvents);
eventRouter.get('/:id', optionalAuthMiddleware, EventController.getEvent);


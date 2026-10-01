import { Response, NextFunction } from 'express';
import { EventService } from '../../services/event.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminEventController {
  static async createEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const event = await EventService.createEvent(req.body);
      sendSuccess(res, event.toSafeJSON(), 201, 'Event created as draft');
    } catch (err) {
      next(err);
    }
  }

  static async updateEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const event = await EventService.updateEvent(req.params.id, req.body);
      sendSuccess(res, event.toSafeJSON(), 200, 'Event updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async publishEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const event = await EventService.publishEvent(req.params.id);
      sendSuccess(res, event.toSafeJSON(), 200, 'Event published successfully');
    } catch (err) {
      next(err);
    }
  }

  static async cancelEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const event = await EventService.cancelEvent(req.params.id);
      sendSuccess(res, event.toSafeJSON(), 200, 'Event cancelled');
    } catch (err) {
      next(err);
    }
  }
}

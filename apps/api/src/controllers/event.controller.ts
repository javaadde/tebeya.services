import { Response, NextFunction } from 'express';
import { EventService } from '../services/event.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/response.js';

export class EventController {
  static async listEvents(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { date, slot, onlyOpen } = req.query as {
        date?: string;
        slot?: any;
        onlyOpen?: string;
      };

      const events = await EventService.listEventsForStaff(userId, {
        date,
        slot,
        onlyOpen: onlyOpen === 'true',
      });

      sendSuccess(res, events, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const event = await EventService.getEventById(req.params.id, userId);
      sendSuccess(res, event, 200);
    } catch (err) {
      next(err);
    }
  }
}

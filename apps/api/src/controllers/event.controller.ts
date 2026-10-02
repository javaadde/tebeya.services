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
      const user = req.user;
      const { date, slot, status, onlyOpen } = req.query as {
        date?: string;
        slot?: any;
        status?: any;
        onlyOpen?: string;
      };

      if (user?.role === 'admin') {
        const events = await EventService.listEventsForAdmin({
          date,
          slot,
          status,
          onlyOpen: onlyOpen === 'true',
        });
        sendSuccess(res, events, 200);
        return;
      }

      const events = await EventService.listEventsForStaff(user?.userId, {
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

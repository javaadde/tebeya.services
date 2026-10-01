import { Response, NextFunction } from 'express';
import { RosterService } from '../../services/roster.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminRosterController {
  static async getRoster(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rosterData = await RosterService.getEventRoster(req.params.id);
      sendSuccess(res, rosterData, 200);
    } catch (err) {
      next(err);
    }
  }

  static async markAttendance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await RosterService.markAttendance(req.params.id, req.body.attendees);
      sendSuccess(res, result, 200, `${result.updatedCount} attendee status(es) updated`);
    } catch (err) {
      next(err);
    }
  }

  static async exportCsv(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const csv = await RosterService.exportRosterCsv(req.params.id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=roster-${req.params.id}.csv`
      );
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}

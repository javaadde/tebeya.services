import { Response, NextFunction } from 'express';
import { InviteService } from '../../services/invite.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminInviteController {
  static async generateCodes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const { count, expiresInMinutes, expiresInHours } = req.body;
      const minutes = expiresInMinutes ?? (expiresInHours ? expiresInHours * 60 : 2);

      const codes = await InviteService.generateInviteCodes(
        adminId,
        count,
        minutes
      );

      sendSuccess(
        res,
        codes.map((c) => c.toSafeJSON()),
        201,
        `${codes.length} invite code(s) generated successfully`
      );
    } catch (err) {
      next(err);
    }
  }

  static async listCodes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = req.query as { status?: any };
      const codes = await InviteService.listInviteCodes({ status });
      sendSuccess(res, codes, 200);
    } catch (err) {
      next(err);
    }
  }

  static async revokeCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const revoked = await InviteService.revokeInviteCode(req.params.id);
      sendSuccess(res, revoked, 200, 'Invite code revoked');
    } catch (err) {
      next(err);
    }
  }
}

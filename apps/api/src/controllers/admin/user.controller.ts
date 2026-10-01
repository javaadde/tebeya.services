import { Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminUserController {
  static async listStaff(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status, search } = req.query as { status?: any; search?: string };
      const staff = await UserService.listStaff({ status, search });
      sendSuccess(res, staff, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getStaffDetail(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const staff = await UserService.getStaffDetail(req.params.id);
      sendSuccess(res, staff, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await UserService.updateStaffStatus(req.params.id, req.body);
      sendSuccess(res, updated, 200, 'Staff status updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

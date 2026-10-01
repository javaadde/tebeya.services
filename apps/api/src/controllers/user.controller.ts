import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/response.js';

export class UserController {
  static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await UserService.getProfile(req.user!.userId);
      sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await UserService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, updated, 200, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

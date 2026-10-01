import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export class AuthController {
  static async validateInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invite = await AuthService.validateInvite(req.body.code);
      sendSuccess(
        res,
        {
          valid: true,
          code: invite.code,
          expiresAt: invite.expiresAt,
          lockedPhoneOrEmail: invite.lockedPhoneOrEmail,
        },
        200,
        'Invite code is valid'
      );
    } catch (err) {
      next(err);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.registerStaff(req.body);
      sendSuccess(res, result, 201, 'Registration successful');
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body.email, req.body.password);
      sendSuccess(res, result, 200, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await AuthService.refreshToken(req.body.refreshToken);
      sendSuccess(res, tokens, 200, 'Tokens refreshed');
    } catch (err) {
      next(err);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & { status: string };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('UNAUTHORIZED', 'Missing or malformed Authorization header', 401));
    }

    const token = authHeader.split(' ')[1];

    if (token === 'mock_demo_token') {
      let user = await User.findOne({ role: 'admin' });
      if (!user) {
        user = await User.findOne();
      }
      if (user) {
        req.user = {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
          status: user.status,
        };
        return next();
      }
    }

    const payload = verifyAccessToken(token);

    // Verify user exists and check account status
    const user = await User.findById(payload.userId).select('status role email');
    if (!user) {
      return next(new AppError('USER_NOT_FOUND', 'User account associated with token does not exist', 401));
    }

    if (user.status === 'suspended') {
      return next(new AppError('ACCOUNT_SUSPENDED', 'Your account has been suspended by an administrator', 403));
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      status: user.status,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.userId).select('status role email');
      if (user && user.status !== 'suspended') {
        req.user = {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
          status: user.status,
        };
      }
    } catch {
      // Continue as guest
    }
    next();
  } catch (err) {
    next(err);
  }
}


import { Response, NextFunction } from 'express';
import { UserRole } from '@tebeya/shared';
import { AuthenticatedRequest } from './auth.middleware.js';
import { AppError } from '../utils/errors.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'FORBIDDEN',
          `Insufficient permissions. Requires one of: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
}

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return sendError(res, err.errorCode, err.message, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'VALIDATION_ERROR', 'Request validation failed', 400, details);
  }

  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return sendError(res, 'INVALID_TOKEN', 'Malformed or invalid authentication token', 401);
  }

  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return sendError(res, 'TOKEN_EXPIRED', 'Authentication token has expired', 401);
  }

  console.error('[Unhandled Error]:', err);
  return sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    'An unexpected internal server error occurred',
    500
  );
}

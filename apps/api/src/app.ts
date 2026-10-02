import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { sendError } from './utils/response.js';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (native mobile apps, curl) or in development
        if (!origin || ENV.NODE_ENV === 'development') {
          return callback(null, true);
        }
        if (origin === ENV.CORS_ORIGIN) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));

  app.get('/', (_req, res) => {
    res.json({
      name: 'Tebeya Services API',
      version: '1.0.0',
      description: 'Backend API for Catering Staff Booking App',
      endpoints: {
        health: '/api/health',
        api: '/api',
      },
    });
  });

  app.use('/api', apiRouter);

  // Fallback 404 handler
  app.use((_req, res) => {
    sendError(res, 'NOT_FOUND', 'Requested route does not exist', 404);
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

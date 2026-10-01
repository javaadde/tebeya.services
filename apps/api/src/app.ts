import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));

  app.use('/api', apiRouter);

  app.get('/', (_req, res) => {
    res.json({
      name: 'Tebeya Services API',
      version: '1.0.0',
      description: 'Backend API for Catering Staff Booking App',
      endpoints: {
        health: '/api/health',
      },
    });
  });

  return app;
}

import { Request, Response } from 'express';

export function getHealthStatus(_req: Request, res: Response) {
  res.json({
    status: 'ok',
    service: 'tebeya-services-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

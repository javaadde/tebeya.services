import { Router } from 'express';
import { EarningsController } from '../controllers/earnings.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const earningsRouter = Router();

earningsRouter.use(authMiddleware);

earningsRouter.get('/summary', EarningsController.getSummary);
earningsRouter.get('/history', EarningsController.getHistory);

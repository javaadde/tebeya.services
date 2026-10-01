import { Router } from 'express';
import { AdminPaymentController } from '../../controllers/admin/payment.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { markPaidSchema, updateWageRuleSchema } from '../../schemas/roster.schema.js';

export const adminPaymentRouter = Router();

adminPaymentRouter.use(authMiddleware, requireRole('admin'));

adminPaymentRouter.post('/mark-paid', validateBody(markPaidSchema), AdminPaymentController.markPaid);
adminPaymentRouter.get('/wage-rules', AdminPaymentController.getWageRule);
adminPaymentRouter.put('/wage-rules', validateBody(updateWageRuleSchema), AdminPaymentController.updateWageRule);

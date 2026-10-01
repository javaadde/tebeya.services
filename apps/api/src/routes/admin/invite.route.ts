import { Router } from 'express';
import { AdminInviteController } from '../../controllers/admin/invite.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { generateInviteSchema } from '../../schemas/invite.schema.js';

export const adminInviteRouter = Router();

adminInviteRouter.use(authMiddleware, requireRole('admin'));

adminInviteRouter.post('/', validateBody(generateInviteSchema), AdminInviteController.generateCodes);
adminInviteRouter.get('/', AdminInviteController.listCodes);
adminInviteRouter.post('/:id/revoke', AdminInviteController.revokeCode);

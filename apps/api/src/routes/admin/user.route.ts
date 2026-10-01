import { Router } from 'express';
import { AdminUserController } from '../../controllers/admin/user.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { updateStaffStatusSchema } from '../../schemas/user.schema.js';

export const adminUserRouter = Router();

adminUserRouter.use(authMiddleware, requireRole('admin'));

adminUserRouter.get('/', AdminUserController.listStaff);
adminUserRouter.get('/:id', AdminUserController.getStaffDetail);
adminUserRouter.patch('/:id/status', validateBody(updateStaffStatusSchema), AdminUserController.updateStatus);

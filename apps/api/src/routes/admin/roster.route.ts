import { Router } from 'express';
import { AdminRosterController } from '../../controllers/admin/roster.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { markAttendanceSchema } from '../../schemas/roster.schema.js';

export const adminRosterRouter = Router({ mergeParams: true });

adminRosterRouter.use(authMiddleware, requireRole('admin'));

adminRosterRouter.get('/:id/roster', AdminRosterController.getRoster);
adminRosterRouter.patch(
  '/:id/roster/attendance',
  validateBody(markAttendanceSchema),
  AdminRosterController.markAttendance
);
adminRosterRouter.get('/:id/roster/export', AdminRosterController.exportCsv);

import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../schemas/user.schema.js';

export const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get('/me', UserController.getMe);
userRouter.patch('/me', validateBody(updateProfileSchema), UserController.updateMe);

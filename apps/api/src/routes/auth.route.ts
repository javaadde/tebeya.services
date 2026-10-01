import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  validateInviteSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/validate-invite', validateBody(validateInviteSchema), AuthController.validateInvite);
authRouter.post('/register', validateBody(registerSchema), AuthController.register);
authRouter.post('/login', validateBody(loginSchema), AuthController.login);
authRouter.post('/refresh-token', validateBody(refreshTokenSchema), AuthController.refreshToken);

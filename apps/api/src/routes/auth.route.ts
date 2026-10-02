import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  validateInviteSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  sendAdminOtpSchema,
  verifyAdminOtpSchema,
} from '../schemas/auth.schema.js';

import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/validate-invite', validateBody(validateInviteSchema), AuthController.validateInvite);
authRouter.post('/verify-invite', validateBody(validateInviteSchema), AuthController.validateInvite);
authRouter.post('/register', validateBody(registerSchema), AuthController.register);
authRouter.post('/login', validateBody(loginSchema), AuthController.login);
authRouter.post('/refresh-token', validateBody(refreshTokenSchema), AuthController.refreshToken);
authRouter.post('/refresh', validateBody(refreshTokenSchema), AuthController.refreshToken);
authRouter.post('/demo-login', AuthController.demoLogin);
authRouter.get('/me', authMiddleware, UserController.getMe);

// Admin OTP Authentication (Restricted to emails in ADMIN_WEB_CONTROLL_EMAILS)
authRouter.post('/admin/send-otp', validateBody(sendAdminOtpSchema), AuthController.sendAdminOtp);
authRouter.post('/admin/verify-otp', validateBody(verifyAdminOtpSchema), AuthController.verifyAdminOtp);


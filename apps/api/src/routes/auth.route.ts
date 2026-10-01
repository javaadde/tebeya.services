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

export const authRouter = Router();

authRouter.post('/validate-invite', validateBody(validateInviteSchema), AuthController.validateInvite);
authRouter.post('/register', validateBody(registerSchema), AuthController.register);
authRouter.post('/login', validateBody(loginSchema), AuthController.login);
authRouter.post('/refresh-token', validateBody(refreshTokenSchema), AuthController.refreshToken);

// Admin OTP Authentication (Restricted to emails in ADMIN_WEB_CONTROLL_EMAILS)
authRouter.post('/admin/send-otp', validateBody(sendAdminOtpSchema), AuthController.sendAdminOtp);
authRouter.post('/admin/verify-otp', validateBody(verifyAdminOtpSchema), AuthController.verifyAdminOtp);


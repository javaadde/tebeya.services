import { z } from 'zod';

export const validateInviteSchema = z.object({
  code: z.string().trim().min(3, 'Invite code is required'),
});

export const registerSchema = z.object({
  inviteCode: z.string().trim().min(3, 'Invite code is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z.string().trim().min(10, 'Phone must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const sendAdminOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const verifyAdminOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otp: z.string().trim().min(4, 'OTP code is required'),
});


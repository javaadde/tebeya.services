import { z } from 'zod';

export const generateInviteSchema = z.object({
  count: z.number().int().min(1).max(50).default(1),
  expiresInMinutes: z.number().int().min(1).max(120).default(2),
  expiresInHours: z.number().int().optional(),
  lockedPhoneOrEmail: z.string().trim().optional(),
});

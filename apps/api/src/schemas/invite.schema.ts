import { z } from 'zod';

export const generateInviteSchema = z.object({
  count: z.number().int().min(1).max(50).default(1),
  expiresInHours: z.number().int().min(1).max(720).default(48),
  lockedPhoneOrEmail: z.string().trim().optional(),
});

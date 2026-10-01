import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  profileImageUrl: z.string().url().optional(),
  idProofUrl: z.string().optional(),
  address: z
    .object({
      text: z.string().min(2),
      lat: z.number().optional(),
      lng: z.number().optional(),
      confirmed: z.boolean().default(false),
    })
    .optional(),
});

export const updateStaffStatusSchema = z.object({
  status: z.enum(['pending_verification', 'active', 'suspended']).optional(),
  phoneVerified: z.boolean().optional(),
});

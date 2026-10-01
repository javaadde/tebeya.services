import { z } from 'zod';

export const joinEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  acknowledgedDoubleBooking: z.boolean().default(false),
});

export const leaveEventSchema = z.object({
  reason: z.string().optional(),
});

export const myBookingsQuerySchema = z.object({
  type: z.enum(['upcoming', 'history']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month format must be YYYY-MM').optional(),
});

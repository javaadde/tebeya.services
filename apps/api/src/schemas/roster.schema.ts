import { z } from 'zod';

export const markAttendanceSchema = z.object({
  attendees: z
    .array(
      z.object({
        bookingId: z.string().min(1),
        attendance: z.enum(['pending', 'present', 'absent', 'late']),
      })
    )
    .min(1, 'At least one attendee status must be provided'),
});

export const markPaidSchema = z.object({
  bookingIds: z.array(z.string().min(1)).min(1, 'At least one bookingId required'),
});

export const updateWageRuleSchema = z.object({
  basePay: z.number().min(0).optional(),
  freeKm: z.number().min(0).optional(),
  perKmRate: z.number().min(0).optional(),
});

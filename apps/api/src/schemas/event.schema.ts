import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createEventSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  date: z.string().regex(dateRegex, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z
    .string()
    .regex(timeRegex, 'Start time must be formatted as HH:mm')
    .transform((t) => t.slice(0, 5)),
  endTime: z
    .string()
    .regex(timeRegex, 'End time must be formatted as HH:mm')
    .transform((t) => t.slice(0, 5)),
  slot: z.enum(['breakfast', 'lunch', 'snacks', 'dinner', 'custom']),
  venue: z.object({
    text: z.string().trim().min(2, 'Venue description is required'),
    lat: z
      .number()
      .nullable()
      .optional()
      .transform((v) => (v === null ? undefined : v)),
    lng: z
      .number()
      .nullable()
      .optional()
      .transform((v) => (v === null ? undefined : v)),
  }),
  headcount: z.number().int().min(1, 'Headcount must be at least 1'),
  payPerPerson: z.number().min(0, 'Pay must be non-negative'),
  status: z.enum(['draft', 'published', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  dressCode: z.string().optional(),
  contactPerson: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const listEventsQuerySchema = z.object({
  date: z.string().regex(dateRegex).optional(),
  slot: z.enum(['breakfast', 'lunch', 'snacks', 'dinner', 'custom']).optional(),
  status: z.enum(['draft', 'published', 'completed', 'cancelled']).optional(),
  onlyOpen: z.enum(['true', 'false']).optional(),
});

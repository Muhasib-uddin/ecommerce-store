import { z } from 'zod';
import { CUSTOMER_ACTIVITY_TYPES } from '@repo/shared';

export const trackActivityInputSchema = z.object({
  type: z.enum(CUSTOMER_ACTIVITY_TYPES),
  sessionId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  searchQuery: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  duration: z.number().int().nonnegative().optional().nullable(),
});

export const activityQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  type: z.enum(CUSTOMER_ACTIVITY_TYPES).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  timeRange: z.enum(['24h', '7d', '30d', 'all']).optional().default('30d'),
});

export type TrackActivityInput = z.infer<typeof trackActivityInputSchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;

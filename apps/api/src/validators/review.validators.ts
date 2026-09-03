import { z } from 'zod';

export const submitReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot be more than 5'),
  title: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
});

export const moderateReviewSchema = z.object({
  approved: z.boolean(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;

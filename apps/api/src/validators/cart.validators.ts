import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  productVariantId: z.string().uuid('Invalid variant ID').optional().nullable(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const mergeCartSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;

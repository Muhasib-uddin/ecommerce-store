import { z } from 'zod';

/**
 * Validates the request body for creating a Stripe Payment Intent.
 * At least one of orderId or sessionId should be provided to identify
 * the cart/order context.
 */
export const createIntentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format').optional(),
  sessionId: z.string().min(1, 'Session ID must not be empty').optional(),
  couponCode: z.string().optional(),
});

/**
 * Validates the request body for capturing a PayPal order.
 * Both the internal order ID and PayPal's order ID are required.
 */
export const capturePayPalSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  paypalOrderId: z.string().min(1, 'PayPal order ID is required'),
});

/**
 * Validates the request body for processing a refund.
 * Both fields are optional — reason is a text note and amount enables partial refunds.
 */
export const refundSchema = z.object({
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional(),
  amount: z
    .number()
    .positive('Refund amount must be a positive number')
    .finite('Refund amount must be a finite number')
    .optional(),
});

export type CreateIntentInput = z.infer<typeof createIntentSchema>;
export type CapturePayPalInput = z.infer<typeof capturePayPalSchema>;
export type RefundInput = z.infer<typeof refundSchema>;

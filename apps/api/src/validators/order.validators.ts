import { z } from 'zod';
import { PaymentMethod, OrderStatus } from '@prisma/client';

const addressSubSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export const createOrderSchema = z.object({
  sessionId: z.string().optional().nullable(), // For guest checkout cart lookup
  customerEmail: z.string().email().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentIntentId: z.string().optional().nullable(),
  shippingAddress: addressSubSchema,
  billingAddress: addressSubSchema,
  couponCode: z.string().optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  shippingCarrier: z.string().optional().nullable(),
});

export const refundSchema = z.object({
  reason: z.string().optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type RefundInput = z.infer<typeof refundSchema>;

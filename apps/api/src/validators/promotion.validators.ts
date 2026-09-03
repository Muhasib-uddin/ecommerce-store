import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.coerce.number().positive('Discount value must be positive'),
  minOrderValue: z.coerce.number().nonnegative().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const discountSchema = z.object({
  name: z.string().min(1, 'Discount name is required'),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.coerce.number().positive('Discount value must be positive'),
  targetType: z.enum(['PRODUCT', 'CATEGORY', 'ALL']),
  targetId: z.string().uuid('Invalid target ID').optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const flashSaleProductSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  price: z.coerce.number().positive('Flash sale price must be positive'),
  limitPerUser: z.number().int().positive().default(1),
  stock: z.number().int().nonnegative('Stock must be non-negative'),
});

export const flashSaleSchema = z.object({
  name: z.string().min(1, 'Flash sale name is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
  products: z.array(flashSaleProductSchema).min(1, 'At least one product is required for flash sale'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
  orderValue: z.coerce.number().positive('Order value must be positive'),
});

export type CouponInput = z.infer<typeof couponSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type FlashSaleInput = z.infer<typeof flashSaleSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

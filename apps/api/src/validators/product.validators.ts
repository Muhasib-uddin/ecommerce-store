import { z } from 'zod';

const productImageSchema = z.object({
  url: z.string().min(1, 'Image URL or data is required'),
  isPrimary: z.boolean().default(false),
  position: z.number().int().nonnegative().default(0),
});

const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'Variant SKU is required'),
  price: z.coerce.number().nonnegative('Variant price must be non-negative'),
  compareAtPrice: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  imageUrl: z.string().optional().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().uuid('Invalid category ID').optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  description: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  richContent: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  price: z.coerce.number().positive('Price must be greater than zero'),
  compareAtPrice: z.coerce.number().positive().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  costPrice: z.coerce.number().positive().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  stock: z.coerce.number().int().nonnegative().default(0),
  trackStock: z.boolean().default(true),
  published: z.boolean().default(true),
  images: z.array(productImageSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
  tags: z.array(z.string().min(1)).optional().default([]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  description: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  richContent: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  price: z.coerce.number().positive().optional(),
  compareAtPrice: z.coerce.number().positive().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  costPrice: z.coerce.number().positive().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  sku: z.string().min(1).optional(),
  barcode: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  stock: z.coerce.number().int().nonnegative().optional(),
  trackStock: z.boolean().optional(),
  published: z.boolean().optional(),
  images: z.array(productImageSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

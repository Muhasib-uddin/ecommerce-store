import { z } from 'zod';

export const categorySchema = z.object({
  parentId: z.string().uuid('Invalid parent category ID').optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be URL-friendly (only lowercase letters, numbers, and hyphens)'),
  description: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  imageUrl: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

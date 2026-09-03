import { z } from 'zod';

const slugRegex = /^[a-z0-9-]+$/;

export const blogCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required').regex(slugRegex, 'Slug must be URL-friendly (only lowercase letters, numbers, and hyphens)'),
});

export const blogPostSchema = z.object({
  categoryId: z.string().uuid('Invalid blog category ID').optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(slugRegex, 'Slug must be URL-friendly (only lowercase letters, numbers, and hyphens)'),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().url('Invalid image URL').optional().nullable(),
  authorName: z.string().min(1, 'Author name is required'),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().default(false),
});

export const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(slugRegex, 'Slug must be URL-friendly (only lowercase letters, numbers, and hyphens)'),
  content: z.string().min(1, 'Content is required'),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().default(false),
});

export const menuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
});

export const menuItemSchema = z.object({
  menuId: z.string().uuid('Invalid menu ID'),
  parentId: z.string().uuid('Invalid parent item ID').optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  url: z.string().min(1, 'URL is required'),
  position: z.number().int().default(0),
});

export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type PageInput = z.infer<typeof pageSchema>;
export type MenuInput = z.infer<typeof menuSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;

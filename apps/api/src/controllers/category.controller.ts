import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/v1/categories
 * Fetch category tree structure.
 */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { all } = req.query; // If all=true, include inactive categories

    const where = all === 'true' ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Build recursive parent-child tree mapping
    const categoryMap = new Map<string, any>();
    const rootCategories: any[] = [];

    // Initialize all mapped categories with children array
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Construct parent-child relationship
    categories.forEach((cat) => {
      const mapped = categoryMap.get(cat.id);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(mapped);
        } else {
          // If parent is not active or doesn't exist, treat as root
          rootCategories.push(mapped);
        }
      } else {
        rootCategories.push(mapped);
      }
    });

    res.json({
      success: true,
      data: {
        categories: rootCategories,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/categories
 * Create category. Admin only.
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { parentId, name, slug, description, imageUrl, isActive } = req.body;

    // Check unique slug
    const existing = await prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Category slug ${slug} is already in use.`, 400);
    }

    // Verify parent exists if provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new AppError('Parent category not found.', 400);
      }
    }

    const category = await prisma.category.create({
      data: {
        parentId: parentId || null,
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/categories/:id
 * Update category. Admin only.
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { parentId, name, slug, description, imageUrl, isActive } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new AppError('Category not found.', 404);
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugCheck = await prisma.category.findUnique({
        where: { slug },
      });
      if (slugCheck) {
        throw new AppError(`Category slug ${slug} is already in use.`, 400);
      }
    }

    // Prevent making a category a child of itself
    if (parentId === id) {
      throw new AppError('A category cannot be its own parent.', 400);
    }

    // Verify parent exists
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new AppError('Parent category not found.', 400);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        parentId: parentId !== undefined ? parentId : undefined,
        name,
        slug,
        description,
        imageUrl,
        isActive,
      },
    });

    res.json({
      success: true,
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/categories/:id
 * Delete category. Admin only.
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    // Delete category - children will be SetNull according to Schema: parentId is SetNull on cascade
    await prisma.category.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

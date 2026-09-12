import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { activityService } from '../services/activity.service.js';

/**
 * GET /api/v1/products
 * Fetch products list with filtering, sorting, pagination, and search.
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      published,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};

    // Filter by Category Slug or ID
    if (category) {
      where.OR = [
        { categoryId: category as string },
        { category: { slug: category as string } }
      ];
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    // Filter by Stock Status
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Filter by Published status (public users can only see published, admins can view all)
    if (published === 'true') {
      where.published = true;
    } else if (published === 'false') {
      where.published = false;
    } else if (published === 'all' || published === '' || req.query.all === 'true') {
      // Do not filter by published status - return both published and draft
    } else if (published === undefined) {
      // Default to only published products if not requested otherwise (for storefront)
      where.published = true;
    }

    // Text search
    if (search) {
      const searchStr = search as string;
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: searchStr, mode: 'insensitive' } },
            { description: { contains: searchStr, mode: 'insensitive' } },
            { sku: { contains: searchStr, mode: 'insensitive' } },
            { category: { name: { contains: searchStr, mode: 'insensitive' } } }
          ],
        },
      ];
    }

    // Order mapping
    const orderBy: any = {};
    if (['createdAt', 'price', 'averageRating', 'views'].includes(sortBy as string)) {
      orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { position: 'asc' },
          },
          variants: true,
          tags: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    if (search && typeof search === 'string' && search.trim()) {
      activityService.trackActivity({
        type: 'SEARCH',
        userId: req.user?.id || null,
        searchQuery: (search as string).trim(),
        metadata: {
          resultCount: total,
          category: category || null,
        },
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
      });
    }

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/slug/:slug
 * Get product details by slug, including categories, images, variants, reviews.
 * Also increments views.
 */
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError('Product slug is required.', 400);
    }

    // Find and increment view count
    const product = await prisma.product.update({
      where: { slug },
      data: {
        views: { increment: 1 },
      },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' },
        },
        variants: true,
        tags: true,
        reviews: {
          where: { approved: true },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    activityService.trackActivity({
      type: 'PRODUCT_VIEW',
      userId: req.user?.id || null,
      productId: product.id,
      categoryId: product.categoryId,
      metadata: {
        slug: product.slug,
        name: product.name,
        price: parseFloat(product.price.toString()),
      },
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
    });

    res.json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    // If not found
    next(error);
  }
};

/**
 * GET /api/v1/products/:id
 * Get product by ID.
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' },
        },
        variants: true,
        tags: true,
        reviews: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    res.json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/products
 * Create a new product. Admin only.
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      categoryId,
      description,
      richContent,
      price,
      compareAtPrice,
      costPrice,
      sku,
      barcode,
      stock,
      trackStock,
      published,
      images,
      variants,
      tags,
    } = req.body;

    // Check unique sku
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });
    if (existingSku) {
      throw new AppError(`A product with SKU ${sku} already exists.`, 400);
    }

    // Auto-generate slug if not provided, or build standard slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId: categoryId || null,
        description: description || null,
        richContent: richContent || null,
        price,
        compareAtPrice: compareAtPrice || null,
        costPrice: costPrice || null,
        sku,
        barcode: barcode || null,
        stock,
        trackStock: trackStock ?? true,
        published: published ?? false,
        images: {
          create: images || [],
        },
        variants: {
          create: variants || [],
        },
        tags: {
          connectOrCreate: (tags || []).map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        images: true,
        variants: true,
        tags: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/products/:id
 * Update product general details, variants, tags, images. Admin only.
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      description,
      richContent,
      price,
      compareAtPrice,
      costPrice,
      sku,
      barcode,
      stock,
      trackStock,
      published,
      images,
      variants,
      tags,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    if (!existingProduct) {
      throw new AppError('Product not found.', 404);
    }

    // If sku is updating, verify uniqueness
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingSku) {
        throw new AppError(`A product with SKU ${sku} already exists.`, 400);
      }
    }

    // Handle tags replacement
    let tagsUpdate = undefined;
    if (tags !== undefined) {
      // Disconnect all previous tags and connect the new set
      tagsUpdate = {
        set: [],
        connectOrCreate: tags.map((tag: string) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      };
    }

    // Update images if provided
    if (images !== undefined) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
    }

    // Update variants if provided
    if (variants !== undefined) {
      // Deleting all old variants and creating new ones is the simplest way to sync.
      // But order items could be referencing variant, though variant onDelete is SetNull.
      // Alternatively, we can update or create individually. Let's delete and recreate to be robust.
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        description,
        richContent,
        price,
        compareAtPrice: compareAtPrice !== undefined ? compareAtPrice : undefined,
        costPrice: costPrice !== undefined ? costPrice : undefined,
        sku,
        barcode,
        stock,
        trackStock,
        published,
        tags: tagsUpdate,
        images: images ? {
          create: images,
        } : undefined,
        variants: variants ? {
          create: variants,
        } : undefined,
      },
      include: {
        images: true,
        variants: true,
        tags: true,
      },
    });

    res.json({
      success: true,
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/products/:id
 * Delete product. Admin only.
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    // Cascade delete because of schema settings
    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

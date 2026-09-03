import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * POST /api/v1/reviews
 * Submit a product review. Customer only.
 */
export const submitReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    // 1. Verify if user bought the product first
    const purchase = await prisma.order.findFirst({
      where: {
        userId,
        items: {
          some: { productId },
        },
      },
    });

    if (!purchase) {
      throw new AppError('You must purchase this product before writing a review.', 400);
    }

    // 2. Check for duplicate review
    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: { productId, userId },
      },
    });

    if (existing) {
      throw new AppError('You have already submitted a review for this product.', 400);
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title: title || null,
        comment: comment || null,
        approved: false, // Moderated by default
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted. It will be visible once approved.',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reviews/product/:productId
 * Get approved reviews for a product (public).
 */
export const getReviewsByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/reviews/:id/moderate
 * Approve or reject review. Recalculate product ratings on approval. Admin only.
 */
export const moderateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found.', 404);
    }

    // Update review approved status
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { approved },
    });

    // Recalculate average rating and review count on Product
    const siblingReviews = await prisma.review.findMany({
      where: {
        productId: review.productId,
        approved: true,
      },
      select: {
        rating: true,
      },
    });

    const reviewCount = siblingReviews.length;
    const averageRating = reviewCount > 0
      ? siblingReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating,
        reviewCount,
      },
    });

    res.json({
      success: true,
      message: `Review has been ${approved ? 'approved' : 'rejected'}.`,
      data: {
        review: updatedReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

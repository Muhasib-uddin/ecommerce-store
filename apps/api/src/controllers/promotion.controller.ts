import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// ============================================================
// 1. Coupons
// ============================================================

/**
 * GET /api/v1/promotions/coupons/validate
 * Validate coupon code (public).
 */
export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = (req.query.code as string)?.toUpperCase();
    const orderValue = parseFloat(req.query.orderValue as string || '0');

    if (!code || isNaN(orderValue) || orderValue <= 0) {
      throw new AppError('Code and valid orderValue are required parameters.', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon.', 400);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new AppError('Coupon has expired or is not active yet.', 400);
    }

    if (coupon.minOrderValue && orderValue < parseFloat(coupon.minOrderValue.toString())) {
      throw new AppError(`Order value must be at least $${coupon.minOrderValue} to apply this coupon.`, 400);
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached.', 400);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = orderValue * (parseFloat(coupon.discountValue.toString()) / 100);
    } else {
      discountAmount = parseFloat(coupon.discountValue.toString());
    }

    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    res.json({
      success: true,
      data: {
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/promotions/coupons
 * Create a new coupon. Admin only.
 */
export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, usageLimit, startDate, endDate, isActive } = req.body;

    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (existing) {
      throw new AppError(`Coupon with code ${code} already exists.`, 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        discountValue,
        minOrderValue: minOrderValue !== undefined ? minOrderValue : null,
        usageLimit: usageLimit !== undefined ? usageLimit : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/promotions/coupons
 * List all coupons. Admin only.
 */
export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/promotions/coupons/:id
 * Delete coupon. Admin only.
 */
export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 2. Automatic Discounts
// ============================================================

/**
 * POST /api/v1/promotions/discounts
 * Create automated store-wide or targeted discount. Admin only.
 */
export const createDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, discountType, discountValue, targetType, targetId, startDate, endDate, isActive } = req.body;

    const discount = await prisma.discount.create({
      data: {
        name,
        discountType,
        discountValue,
        targetType,
        targetId: targetId || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      data: { discount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/promotions/discounts
 * List all automatic discounts. Admin only.
 */
export const getDiscounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { discounts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/promotions/discounts/:id
 * Delete automatic discount. Admin only.
 */
export const deleteDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.discount.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Discount deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 3. Flash Sales
// ============================================================

/**
 * GET /api/v1/promotions/flash-sales/active
 * Get active flash sales (public).
 */
export const getActiveFlashSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const activeSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    res.json({
      success: true,
      data: {
        flashSales: activeSales,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/promotions/flash-sales
 * Create a new flash sale with products. Admin only.
 */
export const createFlashSale = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, startDate, endDate, isActive, products } = req.body;

    const flashSale = await prisma.$transaction(async (tx) => {
      const sale = await tx.flashSale.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive ?? true,
        },
      });

      // Map and create flash sale products
      const pData = products.map((p: any) => ({
        flashSaleId: sale.id,
        productId: p.productId,
        price: p.price,
        limitPerUser: p.limitPerUser ?? 1,
        stock: p.stock,
      }));

      await tx.flashSaleProduct.createMany({
        data: pData,
      });

      return tx.flashSale.findUnique({
        where: { id: sale.id },
        include: { products: true },
      });
    });

    res.status(201).json({
      success: true,
      data: { flashSale },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/promotions/flash-sales
 * List all flash sales. Admin only.
 */
export const getFlashSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const flashSales = await prisma.flashSale.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { flashSales },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/promotions/flash-sales/:id
 * Delete flash sale. Admin only.
 */
export const deleteFlashSale = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.flashSale.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Flash sale deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/v1/customers/admin/list
 * List customers with search, order stats, creation date. Admin only.
 */
export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { role: 'CUSTOMER' };

    if (search) {
      const searchStr = search as string;
      where.OR = [
        { firstName: { contains: searchStr, mode: 'insensitive' } },
        { lastName: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          avatarUrl: true,
          orders: {
            select: {
              total: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedCustomers = customers.map((customer) => {
      const orderCount = customer.orders.length;
      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + parseFloat(order.total.toString()),
        0
      );

      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        createdAt: customer.createdAt,
        avatarUrl: customer.avatarUrl,
        orderCount,
        totalSpent,
      };
    });

    res.json({
      success: true,
      data: {
        customers: formattedCustomers,
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
 * GET /api/v1/customers/addresses
 * Get addresses of the authenticated customer.
 */
export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/customers/addresses
 * Create shipping/billing address.
 */
export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const {
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefaultBilling,
      isDefaultShipping,
    } = req.body;

    // Reset default flags if this new address is set as default
    if (isDefaultBilling) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefaultBilling: true },
        data: { isDefaultBilling: false },
      });
    }

    if (isDefaultShipping) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        firstName,
        lastName,
        company: company || null,
        address1,
        address2: address2 || null,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefaultBilling: isDefaultBilling ?? false,
        isDefaultShipping: isDefaultShipping ?? false,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/customers/addresses/:id
 * Update shipping/billing address.
 */
export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefaultBilling,
      isDefaultShipping,
    } = req.body;

    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new AppError('Address not found.', 404);
    }

    if (existingAddress.userId !== req.user.id) {
      throw new AppError('You do not have permission to modify this address.', 403);
    }

    // Reset default flags if this address is updating to be default
    if (isDefaultBilling) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefaultBilling: true },
        data: { isDefaultBilling: false },
      });
    }

    if (isDefaultShipping) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefaultBilling,
        isDefaultShipping,
      },
    });

    res.json({
      success: true,
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/customers/addresses/:id
 * Delete address.
 */
export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new AppError('Address not found.', 404);
    }

    if (existingAddress.userId !== req.user.id) {
      throw new AppError('You do not have permission to delete this address.', 403);
    }

    await prisma.address.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

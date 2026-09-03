import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

/**
 * GET /api/v1/dashboard/stats
 * Returns aggregate dashboard KPIs and analytics for admin users.
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const [
      totalOrders,
      totalCustomers,
      revenueResult,
      ordersByStatus,
      ordersByPaymentMethod,
      recentOrders,
      totalProducts,
      lowStockProducts,
      topProductsData,
      yearOrders,
    ] = await Promise.all([
      // Total orders count
      prisma.order.count(),

      // Total customers count
      prisma.user.count({ where: { role: 'CUSTOMER' } }),

      // Total revenue (sum of order totals with PAID payment status)
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Orders grouped by payment method
      prisma.order.groupBy({
        by: ['paymentMethod'],
        _count: { paymentMethod: true },
      }),

      // Recent 10 orders with item info
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
            },
          },
        },
      }),

      // Total products
      prisma.product.count(),

      // Low stock products (stock <= 5 and tracking enabled)
      prisma.product.count({
        where: {
          trackStock: true,
          stock: { lte: 5 },
        },
      }),

      // Top products
      prisma.product.findMany({
        take: 5,
        orderBy: [{ reviewCount: 'desc' }, { averageRating: 'desc' }],
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          trackStock: true,
          averageRating: true,
          category: {
            select: { name: true },
          },
          images: {
            take: 1,
            select: { url: true },
          },
        },
      }),

      // Current year orders for sales trends
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        select: {
          total: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
    ]);

    const totalRevenue = revenueResult._sum.total
      ? parseFloat(revenueResult._sum.total.toString())
      : 0;

    const averageOrderValue = totalOrders > 0
      ? parseFloat((totalRevenue / totalOrders).toFixed(2))
      : 0;

    // Format orders by status into an object
    const statusBreakdown: Record<string, number> = {};
    for (const entry of ordersByStatus) {
      statusBreakdown[entry.status] = entry._count.status;
    }

    // Format payment methods breakdown
    const paymentMethodsBreakdown: Record<string, number> = {};
    for (const entry of ordersByPaymentMethod) {
      paymentMethodsBreakdown[entry.paymentMethod] = entry._count.paymentMethod;
    }

    // Calculate monthly sales trend (Jan - Dec)
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlySales = monthNames.map((month) => ({
      month,
      orders: 0,
      revenue: 0,
    }));

    for (const ord of yearOrders) {
      const m = new Date(ord.createdAt).getMonth();
      const monthEntry = monthlySales[m];
      if (monthEntry) {
        monthEntry.orders += 1;
        if (ord.paymentStatus === 'PAID') {
          monthEntry.revenue += parseFloat(ord.total.toString());
        }
      }
    }

    const currentMonthIndex = new Date().getMonth();
    const thisMonthRevenue = monthlySales[currentMonthIndex]?.revenue || 0;
    const thisMonthOrders = monthlySales[currentMonthIndex]?.orders || 0;

    // Recent activity list
    const recentActivity = recentOrders.slice(0, 6).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      title: `Order #${order.orderNumber} (${order.status})`,
      subtitle: `${order.shippingName} • $${parseFloat(order.total.toString()).toFixed(2)}`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      date: order.createdAt,
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          totalCustomers,
          totalProducts,
          lowStockProducts,
          thisMonthRevenue,
          thisMonthOrders,
        },
        ordersByStatus: statusBreakdown,
        paymentMethods: paymentMethodsBreakdown,
        monthlySales,
        topProducts: topProductsData.map((p) => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price.toString()),
          stock: p.stock,
          category: p.category?.name || 'General',
          rating: p.averageRating,
          imageUrl: p.images[0]?.url || null,
        })),
        recentActivity,
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          shippingName: order.shippingName,
          total: parseFloat(order.total.toString()),
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          itemCount: order.items.length,
          items: order.items.map((it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            price: parseFloat(it.price.toString()),
          })),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};


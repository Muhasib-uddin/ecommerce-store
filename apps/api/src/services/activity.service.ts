import prisma from '../lib/prisma.js';
import { getRedisClient } from '../lib/redis.js';
import { CustomerActivityType, Prisma } from '@prisma/client';

export interface TrackActivityData {
  type: CustomerActivityType;
  userId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
  categoryId?: string | null;
  orderId?: string | null;
  searchQuery?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  duration?: number | null;
  createdAt?: Date;
}

const REDIS_ACTIVITY_QUEUE_KEY = 'customer_activities_queue';

class ActivityService {
  /**
   * Track a customer activity event.
   * Pushes to Redis queue for batch insertion, or falls back to direct DB insert.
   * Non-blocking and never throws to caller.
   */
  public async trackActivity(data: TrackActivityData): Promise<void> {
    try {
      const redis = await getRedisClient();
      const payload = {
        ...data,
        createdAt: data.createdAt ? data.createdAt.toISOString() : new Date().toISOString(),
      };

      if (redis && redis.isOpen) {
        await redis.rPush(REDIS_ACTIVITY_QUEUE_KEY, JSON.stringify(payload));
      } else {
        // Fallback: direct insert to PostgreSQL
        await this.insertSingleActivity(data);
      }
    } catch (err: any) {
      console.error('Failed to enqueue activity, falling back to direct DB insert:', err?.message || err);
      try {
        await this.insertSingleActivity(data);
      } catch (dbErr: any) {
        console.error('Critical: Failed direct activity insertion:', dbErr?.message || dbErr);
      }
    }
  }

  private async insertSingleActivity(data: TrackActivityData): Promise<void> {
    await prisma.customerActivity.create({
      data: {
        type: data.type,
        userId: data.userId || null,
        sessionId: data.sessionId || null,
        productId: data.productId || null,
        categoryId: data.categoryId || null,
        orderId: data.orderId || null,
        searchQuery: data.searchQuery || null,
        metadata: data.metadata || Prisma.DbNull,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        duration: data.duration ?? null,
      },
    });
  }

  /**
   * Flush buffered activities from Redis to PostgreSQL in batches.
   */
  public async flushActivities(batchSize = 250): Promise<number> {
    const redis = await getRedisClient();
    if (!redis || !redis.isOpen) return 0;

    let totalFlushed = 0;

    try {
      while (true) {
        // Pop up to batchSize items from Redis queue
        const rawItems = await redis.lPopCount(REDIS_ACTIVITY_QUEUE_KEY, batchSize);
        if (!rawItems || rawItems.length === 0) break;

        const recordsToInsert: Prisma.CustomerActivityCreateManyInput[] = [];

        for (const raw of rawItems) {
          try {
            const item: TrackActivityData = JSON.parse(raw);
            recordsToInsert.push({
              type: item.type,
              userId: item.userId || null,
              sessionId: item.sessionId || null,
              productId: item.productId || null,
              categoryId: item.categoryId || null,
              orderId: item.orderId || null,
              searchQuery: item.searchQuery || null,
              metadata: item.metadata ? item.metadata : Prisma.DbNull,
              ipAddress: item.ipAddress || null,
              userAgent: item.userAgent || null,
              duration: item.duration ?? null,
              createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            });
          } catch (parseErr) {
            console.warn('Skipping unparseable activity queue item:', parseErr);
          }
        }

        if (recordsToInsert.length > 0) {
          const result = await prisma.customerActivity.createMany({
            data: recordsToInsert,
            skipDuplicates: true,
          });
          totalFlushed += result.count;
        }

        // If batch was smaller than requested batchSize, we've drained the queue
        if (rawItems.length < batchSize) break;
      }
    } catch (err: any) {
      console.error('Error during activity batch flush:', err?.message || err);
    }

    return totalFlushed;
  }

  /**
   * Query activities with pagination and filtering for admin table.
   */
  public async getActivityFeed(params: {
    page?: number;
    limit?: number;
    type?: CustomerActivityType;
    userId?: string;
    sessionId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerActivityWhereInput = {};

    if (params.type) {
      where.type = params.type;
    }

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.sessionId) {
      where.sessionId = params.sessionId;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    if (params.search) {
      where.OR = [
        { searchQuery: { contains: params.search, mode: 'insensitive' } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
        { product: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [total, activities] = await Promise.all([
      prisma.customerActivity.count({ where }),
      prisma.customerActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get latest live activity feed.
   */
  public async getLiveActivities(limit = 50) {
    return prisma.customerActivity.findMany({
      take: Math.min(limit, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
          },
        },
      },
    });
  }

  private getDateThreshold(timeRange?: '24h' | '7d' | '30d' | 'all'): Date | null {
    if (!timeRange || timeRange === 'all') return null;
    const now = new Date();
    if (timeRange === '24h') return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (timeRange === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (timeRange === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return null;
  }

  /**
   * Aggregate stats for admin activity overview.
   */
  public async getActivityStats(timeRange: '24h' | '7d' | '30d' | 'all' = '30d') {
    const since = this.getDateThreshold(timeRange);
    const where: Prisma.CustomerActivityWhereInput = since ? { createdAt: { gte: since } } : {};

    // Group count by activity type
    const byType = await prisma.customerActivity.groupBy({
      by: ['type'],
      where,
      _count: {
        _all: true,
      },
    });

    const countsByType = byType.reduce((acc, curr) => {
      acc[curr.type] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    const totalActivities = Object.values(countsByType).reduce((a, b) => a + b, 0);

    // Count unique active users in this period
    const uniqueUsers = await prisma.customerActivity.groupBy({
      by: ['userId'],
      where: {
        ...where,
        userId: { not: null },
      },
    });

    // Count unique sessions in this period
    const uniqueSessions = await prisma.customerActivity.groupBy({
      by: ['sessionId'],
      where: {
        ...where,
        sessionId: { not: null },
      },
    });

    // Top viewed products
    const topProductViews = await prisma.customerActivity.groupBy({
      by: ['productId'],
      where: {
        ...where,
        type: 'PRODUCT_VIEW',
        productId: { not: null },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 5,
    });

    const productIds = topProductViews.map((p) => p.productId!).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, price: true, views: true },
    });

    const topProducts = topProductViews.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        id: item.productId,
        name: prod?.name || 'Unknown Product',
        slug: prod?.slug || '',
        price: prod ? parseFloat(prod.price.toString()) : 0,
        viewCount: item._count._all,
      };
    });

    return {
      timeRange,
      totalActivities,
      uniqueUsersCount: uniqueUsers.length,
      uniqueSessionsCount: uniqueSessions.length,
      countsByType,
      topProducts,
    };
  }

  /**
   * Calculate conversion funnel:
   * 1. Viewers (PAGE_VIEW / PRODUCT_VIEW)
   * 2. Cart Adders (ADD_TO_CART)
   * 3. Checkout Initiators (INITIATE_CHECKOUT)
   * 4. Buyers (PURCHASE)
   */
  public async getConversionFunnel(timeRange: '24h' | '7d' | '30d' | 'all' = '30d') {
    const since = this.getDateThreshold(timeRange);
    const where: Prisma.CustomerActivityWhereInput = since ? { createdAt: { gte: since } } : {};

    // Get counts
    const [viewsCount, cartCount, checkoutCount, purchaseCount] = await Promise.all([
      prisma.customerActivity.count({
        where: {
          ...where,
          type: { in: ['PAGE_VIEW', 'PRODUCT_VIEW'] },
        },
      }),
      prisma.customerActivity.count({
        where: {
          ...where,
          type: 'ADD_TO_CART',
        },
      }),
      prisma.customerActivity.count({
        where: {
          ...where,
          type: 'INITIATE_CHECKOUT',
        },
      }),
      prisma.customerActivity.count({
        where: {
          ...where,
          type: 'PURCHASE',
        },
      }),
    ]);

    const calculateRate = (numerator: number, denominator: number) => {
      if (denominator <= 0) return 0;
      return Number(((numerator / denominator) * 100).toFixed(1));
    };

    return {
      timeRange,
      stages: [
        {
          stage: 'Views',
          name: 'Page & Product Views',
          count: viewsCount,
          conversionFromPrevious: 100,
          overallConversion: 100,
        },
        {
          stage: 'Cart',
          name: 'Added to Cart',
          count: cartCount,
          conversionFromPrevious: calculateRate(cartCount, viewsCount),
          overallConversion: calculateRate(cartCount, viewsCount),
        },
        {
          stage: 'Checkout',
          name: 'Initiated Checkout',
          count: checkoutCount,
          conversionFromPrevious: calculateRate(checkoutCount, cartCount),
          overallConversion: calculateRate(checkoutCount, viewsCount),
        },
        {
          stage: 'Purchase',
          name: 'Completed Purchase',
          count: purchaseCount,
          conversionFromPrevious: calculateRate(purchaseCount, checkoutCount),
          overallConversion: calculateRate(purchaseCount, viewsCount),
        },
      ],
    };
  }

  /**
   * Top search queries with frequency and recent occurrences.
   */
  public async getTopSearches(limit = 20, timeRange: '24h' | '7d' | '30d' = '30d') {
    const since = this.getDateThreshold(timeRange);
    const where: Prisma.CustomerActivityWhereInput = {
      type: 'SEARCH',
      searchQuery: { not: null },
      ...(since ? { createdAt: { gte: since } } : {}),
    };

    const grouped = await prisma.customerActivity.groupBy({
      by: ['searchQuery'],
      where,
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          searchQuery: 'desc',
        },
      },
      take: limit,
    });

    return grouped.map((g) => ({
      query: g.searchQuery || '',
      count: g._count._all,
    }));
  }

  /**
   * Full customer activity journey timeline for a given user.
   */
  public async getCustomerJourney(userId: string, limit = 100) {
    const activities = await prisma.customerActivity.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return {
      user,
      totalCount: activities.length,
      timeline: activities,
    };
  }

  /**
   * Cleanup old activity logs beyond retention period.
   */
  public async cleanupOldActivities(retentionDays = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deleted = await prisma.customerActivity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return deleted.count;
  }
}

export const activityService = new ActivityService();
export default activityService;

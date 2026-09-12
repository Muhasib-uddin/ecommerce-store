import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service.js';
import { trackActivityInputSchema, activityQuerySchema } from '../validators/activity.validators.js';

/**
 * Ingest customer activity from client storefront.
 * Can be authenticated or guest (with sessionId).
 */
export const trackEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = trackActivityInputSchema.parse(req.body);

    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    const userId = req.user?.id || null;

    // Fire and forget - do not await buffer write before returning to client
    activityService.trackActivity({
      type: validated.type,
      userId,
      sessionId: validated.sessionId || null,
      productId: validated.productId || null,
      categoryId: validated.categoryId || null,
      orderId: validated.orderId || null,
      searchQuery: validated.searchQuery || null,
      metadata: validated.metadata || null,
      duration: validated.duration || null,
      ipAddress,
      userAgent,
    });

    res.status(200).json({
      success: true,
      message: 'Activity tracked successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated activity list with filtering (Admin only).
 */
export const getActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = activityQuerySchema.parse(req.query);
    const result = await activityService.getActivityFeed({
      page: query.page,
      limit: query.limit,
      type: query.type,
      userId: query.userId,
      sessionId: query.sessionId,
      startDate: query.startDate,
      endDate: query.endDate,
      search: query.search,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest live activity stream (Admin only).
 */
export const getLiveActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const activities = await activityService.getLiveActivities(limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated activity metrics & counts (Admin only).
 */
export const getActivityStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timeRange = (req.query.timeRange as '24h' | '7d' | '30d' | 'all') || '30d';
    const stats = await activityService.getActivityStats(timeRange);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversion funnel metrics (Admin only).
 */
export const getConversionFunnel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timeRange = (req.query.timeRange as '24h' | '7d' | '30d' | 'all') || '30d';
    const funnel = await activityService.getConversionFunnel(timeRange);

    res.json({
      success: true,
      data: funnel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top search terms (Admin only).
 */
export const getTopSearches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const timeRange = (req.query.timeRange as '24h' | '7d' | '30d') || '30d';
    const searches = await activityService.getTopSearches(limit, timeRange);

    res.json({
      success: true,
      data: searches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer journey timeline for a specific user (Admin only).
 */
export const getCustomerJourney = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const journey = await activityService.getCustomerJourney(userId, limit);

    res.json({
      success: true,
      data: journey,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually flush buffered activities to PostgreSQL.
 */
export const flushBuffer = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const flushedCount = await activityService.flushActivities();
    res.json({
      success: true,
      message: `Flushed ${flushedCount} activities from buffer to database`,
      data: { flushedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger retention policy cleanup (Super Admin only).
 */
export const cleanupActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const retentionDays = req.body.retentionDays ? parseInt(req.body.retentionDays, 10) : 90;
    const deletedCount = await activityService.cleanupOldActivities(retentionDays);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} activities older than ${retentionDays} days`,
      data: { deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

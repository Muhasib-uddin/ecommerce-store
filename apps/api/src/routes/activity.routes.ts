import { Router } from 'express';
import {
  trackEvent,
  getActivities,
  getLiveActivities,
  getActivityStats,
  getConversionFunnel,
  getTopSearches,
  getCustomerJourney,
  flushBuffer,
  cleanupActivities,
} from '../controllers/activity.controller.js';
import { authenticate, tryAuthenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public / Storefront event ingestion (supports guest or authenticated user)
router.post('/track', tryAuthenticate, trackEvent);

// Admin-protected analytics endpoints
router.use(authenticate);
router.use(requireRole('SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING', 'SUPPORT'));

router.get('/', getActivities);
router.get('/live', getLiveActivities);
router.get('/stats', getActivityStats);
router.get('/funnel', getConversionFunnel);
router.get('/searches', getTopSearches);
router.get('/customer/:userId', getCustomerJourney);
router.post('/flush', flushBuffer);
router.post('/cleanup', requireRole('SUPER_ADMIN'), cleanupActivities);

export default router;

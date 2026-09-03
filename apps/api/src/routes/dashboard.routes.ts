import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get(
  '/stats',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING'),
  getDashboardStats
);

export default router;

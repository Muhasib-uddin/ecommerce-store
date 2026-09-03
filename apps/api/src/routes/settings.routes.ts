import { Router } from 'express';
import {
  getSettings,
  updateSettings,
} from '../controllers/settings.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getSettings);
router.put(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  updateSettings
);

export default router;

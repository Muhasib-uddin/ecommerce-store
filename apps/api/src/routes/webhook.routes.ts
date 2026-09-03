import { Router } from 'express';
import {
  createWebhook,
  getWebhooks,
  updateWebhook,
  deleteWebhook,
  createApiKey,
  getApiKeys,
  deleteApiKey,
} from '../controllers/webhook.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { webhookSchema, apiKeySchema } from '../validators/webhook.validators.js';

const router = Router();

// ============================================================
// Webhooks subscription routes (Admin only)
// ============================================================
router.post(
  '/subscriptions',
  authenticate,
  requireRole('SUPER_ADMIN'),
  validateBody(webhookSchema),
  createWebhook
);
router.get(
  '/subscriptions',
  authenticate,
  requireRole('SUPER_ADMIN'),
  getWebhooks
);
router.put(
  '/subscriptions/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  validateBody(webhookSchema),
  updateWebhook
);
router.delete(
  '/subscriptions/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteWebhook
);

// ============================================================
// API Keys routes (All authenticated users can manage their keys)
// ============================================================
router.post(
  '/keys',
  authenticate,
  validateBody(apiKeySchema),
  createApiKey
);
router.get(
  '/keys',
  authenticate,
  getApiKeys
);
router.delete(
  '/keys/:id',
  authenticate,
  deleteApiKey
);

export default router;

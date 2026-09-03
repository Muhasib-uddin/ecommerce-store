import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  processRefund,
} from '../controllers/order.controller.js';
import { authenticate, tryAuthenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { createOrderSchema, updateStatusSchema, refundSchema } from '../validators/order.validators.js';

const router = Router();

router.post(
  '/',
  tryAuthenticate,
  validateBody(createOrderSchema),
  createOrder
);

router.get(
  '/',
  authenticate,
  getOrders
);

router.get(
  '/:id',
  authenticate,
  getOrderById
);

router.put(
  '/:id/status',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER', 'SUPPORT'),
  validateBody(updateStatusSchema),
  updateOrderStatus
);

router.post(
  '/:id/refund',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(refundSchema),
  processRefund
);

export default router;

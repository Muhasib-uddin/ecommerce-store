import { Router } from 'express';
import {
  validateCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
  createDiscount,
  getDiscounts,
  deleteDiscount,
  getActiveFlashSales,
  createFlashSale,
  getFlashSales,
  deleteFlashSale,
} from '../controllers/promotion.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { couponSchema, discountSchema, flashSaleSchema } from '../validators/promotion.validators.js';

const router = Router();

// ============================================================
// Coupons
// ============================================================
router.get('/coupons/validate', validateCoupon);
router.post(
  '/coupons',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(couponSchema),
  createCoupon
);
router.get(
  '/coupons',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  getCoupons
);
router.delete(
  '/coupons/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteCoupon
);

// ============================================================
// Automatic Discounts
// ============================================================
router.post(
  '/discounts',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(discountSchema),
  createDiscount
);
router.get(
  '/discounts',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  getDiscounts
);
router.delete(
  '/discounts/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteDiscount
);

// ============================================================
// Flash Sales
// ============================================================
router.get('/flash-sales/active', getActiveFlashSales);
router.post(
  '/flash-sales',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(flashSaleSchema),
  createFlashSale
);
router.get(
  '/flash-sales',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  getFlashSales
);
router.delete(
  '/flash-sales/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteFlashSale
);

export default router;

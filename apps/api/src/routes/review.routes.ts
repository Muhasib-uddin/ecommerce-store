import { Router } from 'express';
import {
  submitReview,
  getReviewsByProduct,
  moderateReview,
} from '../controllers/review.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { submitReviewSchema, moderateReviewSchema } from '../validators/review.validators.js';

const router = Router();

router.post(
  '/',
  authenticate,
  validateBody(submitReviewSchema),
  submitReview
);

router.get(
  '/product/:productId',
  getReviewsByProduct
);

router.put(
  '/:id/moderate',
  authenticate,
  requireRole('SUPER_ADMIN', 'SUPPORT'),
  validateBody(moderateReviewSchema),
  moderateReview
);

export default router;

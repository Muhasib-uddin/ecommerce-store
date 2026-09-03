import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { categorySchema } from '../validators/category.validators.js';

const router = Router();

router.get('/', getCategories);

router.post(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(categorySchema),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(categorySchema),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteCategory
);

export default router;

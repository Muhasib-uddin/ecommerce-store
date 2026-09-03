import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validators.js';

const router = Router();

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

router.post(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteProduct
);

export default router;

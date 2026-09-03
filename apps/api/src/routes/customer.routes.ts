import { Router } from 'express';
import {
  getCustomers,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/customer.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { addressSchema } from '../validators/customer.validators.js';

const router = Router();

// Admin Route
router.get(
  '/admin/list',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  getCustomers
);

// Customer Address Routes
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, validateBody(addressSchema), createAddress);
router.put('/addresses/:id', authenticate, validateBody(addressSchema), updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;

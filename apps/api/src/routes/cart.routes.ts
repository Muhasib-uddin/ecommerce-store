import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  mergeCart,
} from '../controllers/cart.controller.js';
import { authenticate, tryAuthenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import { addToCartSchema, updateCartItemSchema, mergeCartSchema } from '../validators/cart.validators.js';

const router = Router();

router.get('/', tryAuthenticate, getCart);
router.post('/items', tryAuthenticate, validateBody(addToCartSchema), addToCart);
router.put('/items/:id', tryAuthenticate, validateBody(updateCartItemSchema), updateCartItem);
router.delete('/items/:id', tryAuthenticate, removeFromCart);
router.post('/merge', authenticate, validateBody(mergeCartSchema), mergeCart);

export default router;

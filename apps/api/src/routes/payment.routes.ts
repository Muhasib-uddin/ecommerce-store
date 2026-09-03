import { Router } from 'express';
import {
  createIntentHandler,
  webhookHandler,
  capturePayPalOrder,
  paypalWebhookHandler
} from '../controllers/payment.controller.js';
import { tryAuthenticate } from '../middleware/auth.js';

const router = Router();

// Secure Stripe payment intent creation (accessible to guests and authenticated users)
router.post('/create-intent', tryAuthenticate, createIntentHandler);

// Capture PayPal payment and mark order as paid
router.post('/paypal/capture', tryAuthenticate, capturePayPalOrder);

// Stripe webhook endpoint (express.raw is applied in index.ts)
router.post('/webhook', webhookHandler);

// PayPal webhook endpoint
router.post('/webhook/paypal', paypalWebhookHandler);

export default router;

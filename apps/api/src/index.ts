import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import path from 'path';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerRoutes from './routes/customer.routes.js';
import promotionRoutes from './routes/promotion.routes.js';
import reviewRoutes from './routes/review.routes.js';
import cmsRoutes from './routes/cms.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import activityRoutes from './routes/activity.routes.js';
import { webhookHandler as stripeWebhookHandler } from './controllers/payment.controller.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { initCronJobs } from './jobs/index.js';
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), `../../.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const app = express();
const port = process.env.PORT || 5000;

// Security
app.use(helmet());
// Allowed CORS origins (supports apex, www variants, and comma-separated lists)
const rawOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((u) => u.trim()) : ['http://localhost:3000']),
  ...(process.env.ADMIN_URL ? process.env.ADMIN_URL.split(',').map((u) => u.trim()) : ['http://localhost:5173']),
];

const allowedOrigins = new Set<string>();
rawOrigins.forEach((origin) => {
  if (!origin) return;
  allowedOrigins.add(origin);
  try {
    const parsed = new URL(origin);
    if (parsed.hostname.startsWith('www.')) {
      const apex = `${parsed.protocol}//${parsed.hostname.replace(/^www\./, '')}${parsed.port ? `:${parsed.port}` : ''}`;
      allowedOrigins.add(apex);
    } else if (!parsed.hostname.includes('localhost') && !parsed.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      const withWww = `${parsed.protocol}//www.${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}`;
      allowedOrigins.add(withWww);
    }
  } catch {
    // Ignore invalid URL strings
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  credentials: true,
}));

// Stripe Webhook raw body parser mounted BEFORE express.json()
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static serving for simulated offline uploads
app.use('/public/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/activities', activityRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Initialize cron jobs
initCronJobs();

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
});

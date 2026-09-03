import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { rateLimiter, validateBody } from '../middleware/security.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  verify2FASchema,
  twoFactorLoginSchema,
  disable2FASchema,
  socialLoginSchema,
} from '../validators/auth.validators.js';
import {
  register,
  login,
  twoFactorLoginChallenge,
  socialLogin,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getMe,
  setup2FA,
  verify2FA,
  disable2FA,
} from '../controllers/auth.controller.js';

const router = Router();

// Public routes (with rate limiting on sensitive endpoints)
router.post('/register', rateLimiter(), validateBody(registerSchema), register);
router.post('/login', rateLimiter(), validateBody(loginSchema), login);
router.post('/2fa/login-challenge', rateLimiter(), validateBody(twoFactorLoginSchema), twoFactorLoginChallenge);
router.post('/social-login', rateLimiter(), validateBody(socialLoginSchema), socialLogin);
router.post('/refresh', refreshToken);
router.post('/forgot-password', rateLimiter(), validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.post('/verify-email', validateBody(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', rateLimiter(), validateBody(resendVerificationSchema), resendVerification);

// Protected routes (require authentication)
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// 2FA management routes (require authentication)
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, validateBody(verify2FASchema), verify2FA);
router.post('/2fa/disable', authenticate, validateBody(disable2FASchema), disable2FA);

export default router;

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/jwt.js';
import { hashPassword, comparePassword } from '../lib/password.js';
import {
  generateTOTPSecret,
  generateTOTPUri,
  verifyTOTP,
  generateBackupCodes,
  generateQRCodeSVG,
} from '../lib/totp.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
} from '../services/email.service.js';

// ============================================================
// Cookie configuration
// ============================================================

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 1000; // 7 days

// Helper: Hash sensitive tokens before saving in PostgreSQL
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ============================================================
// Helper: set auth cookies
// ============================================================

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
};

// ============================================================
// Controllers
// ============================================================

/**
 * POST /api/v1/auth/register
 * Register a new customer account.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists.', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token (32 bytes raw, stored as SHA-256 hash)
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        role: 'CUSTOMER',
        isEmailVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
      },
    });

    // Send email verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/account/verify-email?token=${rawVerificationToken}`;
    
    sendEmailVerificationEmail(email, firstName || 'Customer', verifyUrl).catch((err) =>
      console.error('Failed to send verification email:', err)
    );

    // Send welcome email
    sendWelcomeEmail(email, firstName || 'Customer').catch((err) =>
      console.error('Failed to send welcome email:', err)
    );

    // Sign tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
      message: 'Registration successful. A verification link has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Log in with email and password.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        twoFactorEnabled: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return a temporary token strictly for 2FA challenge verification (5-minute expiry)
      const tempToken = signAccessToken(tokenPayload);
      res.json({
        success: true,
        data: {
          requires2FA: true,
          tempToken,
        },
        message: 'Two-factor authentication code required.',
      });
      return;
    }

    // Sign tokens
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      },
      message: 'Login successful.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/2fa/login-challenge
 * Complete login for users with 2FA enabled using TOTP code or backup recovery code.
 */
export const twoFactorLoginChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      throw new AppError('Temporary token and 2FA code are required.', 400);
    }

    // Verify temp token
    const decoded = verifyAccessToken(tempToken);

    // Fetch user with 2FA secret and backup codes
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError('Two-factor authentication is not active for this account.', 400);
    }

    const cleanCode = code.trim().toUpperCase();
    let isCodeValid = false;
    let isBackupCode = false;

    // 1. Try TOTP code verification
    if (cleanCode.length === 6 && /^\d{6}$/.test(cleanCode)) {
      isCodeValid = verifyTOTP(cleanCode, user.twoFactorSecret);
    }

    // 2. Try backup recovery code verification
    if (!isCodeValid && user.twoFactorBackupCodes?.length > 0) {
      const matchIndex = user.twoFactorBackupCodes.findIndex(
        (c) => c.toUpperCase() === cleanCode || c.replace('-', '').toUpperCase() === cleanCode.replace('-', '')
      );

      if (matchIndex !== -1) {
        isCodeValid = true;
        isBackupCode = true;

        // Remove consumed backup code
        const updatedBackupCodes = [...user.twoFactorBackupCodes];
        updatedBackupCodes.splice(matchIndex, 1);

        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: updatedBackupCodes },
        });
      }
    }

    if (!isCodeValid) {
      throw new AppError('Invalid two-factor authentication code or backup recovery code.', 401);
    }

    // Issue full session tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Set auth cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        usedBackupCode: isBackupCode,
        accessToken,
        refreshToken,
      },
      message: isBackupCode
        ? 'Login successful with backup recovery code. Please generate new backup codes if needed.'
        : 'Login successful.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/social-login
 * Multi-provider social login (Google, Facebook, Apple, etc.)
 */
export const socialLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, email, firstName, lastName, avatarUrl } = req.body;

    if (!email) {
      throw new AppError('Email address is required for social authentication.', 400);
    }

    // Look for existing user
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      // Create new customer account with random secure password hash
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
          avatarUrl: avatarUrl || null,
          role: 'CUSTOMER',
          isEmailVerified: true, // Social accounts are pre-verified by identity provider
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          isEmailVerified: true,
        },
      });

      sendWelcomeEmail(email, firstName || 'Customer').catch((err) =>
        console.error('Failed to send welcome email for social signup:', err)
      );
    } else if (avatarUrl && !user.avatarUrl) {
      // Update avatar if not present
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });
    }

    // Sign tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Set auth cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
        provider,
      },
      message: `Successfully authenticated with ${provider || 'social provider'}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Refresh the access token using the refresh token cookie.
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.refresh_token;

    if (!token) {
      throw new AppError('Refresh token required.', 401);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Ensure user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    // Sign new access token
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);

    // Set new access token cookie
    setAuthCookies(res, accessToken, token);

    res.json({
      success: true,
      data: {
        user,
        accessToken,
      },
      message: 'Token refreshed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Clear auth cookies.
 */
export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie('access_token', { ...cookieOptions });
    res.clearCookie('refresh_token', { ...cookieOptions });

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Generate and email a password reset link with database persistence and expiration.
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user — always return generic response to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, role: true },
    });

    if (user) {
      // Generate 32-byte raw token and SHA-256 hashed token for DB
      const rawResetToken = crypto.randomBytes(32).toString('hex');
      const hashedResetToken = hashToken(rawResetToken);
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Save token hash and expiry directly in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedResetToken,
          passwordResetExpires: resetExpires,
        },
      });

      // Construct reset URL based on user role or origin
      const origin = req.headers.origin || req.headers.referer;
      const isAdminRequest =
        (origin && origin.includes('5173')) || user.role === 'SUPER_ADMIN' || user.role === 'STORE_MANAGER';
      
      const baseUrl = isAdminRequest
        ? process.env.ADMIN_URL || 'http://localhost:5173'
        : process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const resetUrl = isAdminRequest
        ? `${baseUrl}/reset-password?token=${rawResetToken}`
        : `${baseUrl}/account/reset-password?token=${rawResetToken}`;

      // Dispatch reset email
      sendPasswordResetEmail(user.email, user.firstName || 'User', resetUrl).catch((err) =>
        console.error('Failed to dispatch password reset email:', err)
      );
    }

    res.json({
      success: true,
      message: 'If the email address exists in our system, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Reset password using a valid token stored in PostgreSQL.
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new AppError('Token and new password are required.', 400);
    }

    // Compute hash of incoming raw token
    const hashedResetToken = hashToken(token);

    // Look up user with matching token and valid expiry
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError('The password reset link is invalid or has expired. Please request a new link.', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/verify-email
 * Verify email address using token stored in PostgreSQL.
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Verification token is required.', 400);
    }

    const hashedToken = hashToken(token);

    // Look up user with matching token and valid expiry
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError('Verification link is invalid or has expired. Please request a new verification email.', 400);
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Your email address has been verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/resend-verification
 * Resend verification email to user.
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, isEmailVerified: true },
    });

    if (!user) {
      // Prevent user enumeration
      res.json({
        success: true,
        message: 'If an unverified account with this email exists, a new verification link has been sent.',
      });
      return;
    }

    if (user.isEmailVerified) {
      res.json({
        success: true,
        message: 'This email address is already verified.',
      });
      return;
    }

    // Generate new token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/account/verify-email?token=${rawVerificationToken}`;

    sendEmailVerificationEmail(user.email, user.firstName || 'Customer', verifyUrl).catch((err) =>
      console.error('Failed to resend verification email:', err)
    );

    res.json({
      success: true,
      message: 'A new verification link has been sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Get the current authenticated user's profile.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        user: freshUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/2fa/setup
 * Generate a Base32 secret and QR code URI for 2FA setup.
 */
export const setup2FA = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    // Generate RFC 6238 Base32 secret
    const secret = generateTOTPSecret();
    const storeName = process.env.STORE_NAME || 'LUMIÈRE Store';
    const otpauthUrl = generateTOTPUri(req.user.email, secret, storeName);
    const qrCodeUrl = generateQRCodeSVG(otpauthUrl);

    // Save temporary secret to user record
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret },
    });

    res.json({
      success: true,
      data: {
        secret,
        otpauthUrl,
        qrCodeUrl,
      },
      message: 'Scan the QR code or enter the secret into your authenticator app (Google Authenticator, Authy, etc.).',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/2fa/verify
 * Verify 6-digit TOTP code and activate 2FA + generate backup recovery codes.
 */
export const verify2FA = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      throw new AppError('Please initiate 2FA setup first.', 400);
    }

    // Verify 6-digit TOTP code against stored secret
    const isValid = verifyTOTP(code, user.twoFactorSecret);

    if (!isValid) {
      throw new AppError('Invalid 2FA code. Please ensure your authenticator app time is synced and try again.', 400);
    }

    // Generate 8 single-use backup recovery codes
    const backupCodes = generateBackupCodes(8);

    // Enable 2FA for user and persist backup codes
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes,
      },
    });

    res.json({
      success: true,
      data: {
        twoFactorEnabled: true,
        backupCodes,
      },
      message: 'Two-factor authentication has been successfully activated. Please store your backup recovery codes safely.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/2fa/disable
 * Disable 2FA with password confirmation.
 */
export const disable2FA = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid password confirmation.', 400);
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });

    res.json({
      success: true,
      message: 'Two-factor authentication has been disabled.',
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import prisma from '../lib/prisma.js';

// ============================================================
// Rate Limiter — In-memory, per-IP
// ============================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter middleware factory.
 * @param maxAttempts - Maximum requests allowed in the window (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 */
export const rateLimiter = (
  maxAttempts = 50,
  windowMs = 15 * 60 * 1000
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window has expired — start fresh
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxAttempts) {
      const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    entry.count++;
    next();
  };
};

// ============================================================
// Request Body Validation — Zod
// ============================================================

/**
 * Validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (cleaned) data.
 * On failure, returns 400 with formatted validation errors.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
      return;
    }

    // Replace body with parsed (validated & stripped) data
    req.body = result.data;
    next();
  };
};

// ============================================================
// Audit Log — Logs admin actions to AuditLog table
// ============================================================

/**
 * Audit log middleware factory.
 * Logs the action to the AuditLog table after a successful response.
 * @param action - The action being performed (e.g., "PRODUCT_CREATE")
 * @param entity - The entity type (e.g., "Product")
 */
export const auditLog = (action: string, entity: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Listen for the response to finish
    res.on('finish', async () => {
      // Only log successful actions (status < 400)
      if (res.statusCode < 400) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: req.user?.id || null,
              action,
              entity,
              entityId: req.params.id || null,
              details: JSON.stringify({
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
              }),
              ipAddress: req.ip || req.socket.remoteAddress || null,
            },
          });
        } catch (error) {
          // Silently fail — audit logging should not break the request
          console.error('Failed to write audit log:', error);
        }
      }
    });

    next();
  };
};

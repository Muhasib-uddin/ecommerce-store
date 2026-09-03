import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

// ============================================================
// 1. Webhooks
// ============================================================

export const createWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, url, events, isActive } = req.body;

    // Generate a random webhook secret
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const webhook = await prisma.$transaction(async (tx) => {
      const wh = await tx.webhook.create({
        data: {
          name,
          url,
          secret,
          isActive: isActive ?? true,
        },
      });

      const eventData = events.map((event: string) => ({
        webhookId: wh.id,
        event,
      }));

      await tx.webhookEvent.createMany({
        data: eventData,
      });

      return tx.webhook.findUnique({
        where: { id: wh.id },
        include: { events: true },
      });
    });

    res.status(201).json({
      success: true,
      data: { webhook },
    });
  } catch (error) {
    next(error);
  }
};

export const getWebhooks = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const webhooks = await prisma.webhook.findMany({
      include: { events: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { webhooks },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, url, events, isActive } = req.body;

    const existing = await prisma.webhook.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Webhook subscription not found.', 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (events !== undefined) {
        // Clear events and recreate
        await tx.webhookEvent.deleteMany({
          where: { webhookId: id },
        });

        const eventData = events.map((event: string) => ({
          webhookId: id,
          event,
        }));

        await tx.webhookEvent.createMany({
          data: eventData,
        });
      }

      return tx.webhook.update({
        where: { id },
        data: {
          name,
          url,
          isActive,
        },
        include: { events: true },
      });
    });

    res.json({
      success: true,
      data: { webhook: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.webhook.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Webhook subscription deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 2. Developer API Keys
// ============================================================

export const createApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, scopes, isActive, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    // Generate secure random key
    const rawKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const scopesString = scopes.join(',');

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        keyHash,
        scopes: scopesString,
        isActive: isActive ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'API Key created successfully. Make sure to copy it now; you will not be able to see it again.',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        scopes,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
        key: rawKey, // Expose raw key only ONCE during creation
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApiKeys = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Format scopes back into arrays
    const formatted = apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      scopes: k.scopes.split(','),
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }));

    res.json({
      success: true,
      data: { apiKeys: formatted },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    const key = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!key) {
      throw new AppError('API key not found.', 404);
    }

    // Authorization check
    if (key.userId !== userId && req.user?.role !== 'SUPER_ADMIN') {
      throw new AppError('You do not have permission to delete this API key.', 403);
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'API Key revoked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

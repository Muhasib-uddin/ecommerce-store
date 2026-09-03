import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';
import { metaCapiService } from '../services/meta-capi.service.js';

/**
 * Helper: Find or create cart for user or session.
 */
const getOrCreateCart = async (userId: string | null, sessionId: string): Promise<any> => {
  if (userId) {
    // 1. Try to find by userId
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });

    if (cart) return cart;

    // 2. If user doesn't have a cart, see if there's a guest cart to adopt
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });

    if (cart && !cart.userId) {
      // Adopt guest cart
      return prisma.cart.update({
        where: { id: cart.id },
        data: { userId },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: true,
            },
          },
        },
      });
    }

    // 3. Otherwise, create a brand new cart
    return prisma.cart.create({
      data: {
        userId,
        sessionId,
      },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });
  } else {
    // Guest cart
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId,
        },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  }
};

/**
 * GET /api/v1/carts
 * Get active cart by userId (if authenticated) or sessionId (if guest).
 */
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = (req.query.sessionId as string) || req.cookies?.session_id;
    const userId = req.user?.id || null;

    if (!userId && !sessionId) {
      throw new AppError('Session ID or authentication is required to access cart.', 400);
    }

    const effectiveSessionId = sessionId || `sess_${crypto.randomUUID()}`;
    const cart = await getOrCreateCart(userId, effectiveSessionId);

    // Set cookie if not present
    if (!req.cookies?.session_id && !userId) {
      res.cookie('session_id', effectiveSessionId, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });
    }

    res.json({
      success: true,
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/carts/items
 * Add an item to the cart.
 */
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, productVariantId, quantity, sessionId } = req.body;
    const userId = req.user?.id || null;

    // 1. Verify product and variant
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    let availableStock = product.stock;
    let trackStock = product.trackStock;

    if (productVariantId) {
      const variant = product.variants.find((v) => v.id === productVariantId);
      if (!variant) {
        throw new AppError('Product variant not found.', 404);
      }
      availableStock = variant.stock;
    }

    // Validate stock if tracked
    if (trackStock && availableStock < quantity) {
      throw new AppError(`Insufficient stock. Only ${availableStock} items available.`, 400);
    }

    // 2. Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);

    // 3. Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        productVariantId: productVariantId || null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (trackStock && availableStock < newQuantity) {
        throw new AppError(`Cannot add more items. Insufficient stock.`, 400);
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      res.json({
        success: true,
        data: {
          item: updatedItem,
        },
      });

      // Track AddToCart Event
      metaCapiService.sendAddToCartEvent({
        eventId: `add_${updatedItem.id}_${Date.now()}`,
        email: req.user?.email || undefined,
        value: parseFloat(product.price.toString()) * quantity, // only tracking the added quantity
        currency: 'usd',
        contentIds: [productId],
        clientIp: req.ip || req.headers['x-forwarded-for']?.toString(),
        clientUserAgent: req.headers['user-agent'],
        fbp: req.cookies?._fbp,
        fbc: req.cookies?._fbc,
      }).catch(e => console.error('Meta CAPI AddToCart error:', e));
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productVariantId: productVariantId || null,
          quantity,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          item: newItem,
        },
      });

      // Track AddToCart Event
      const trackItem = newItem;
      metaCapiService.sendAddToCartEvent({
        eventId: `add_${trackItem.id}_${Date.now()}`,
        email: req.user?.email || undefined,
        value: parseFloat(product.price.toString()) * quantity,
        currency: 'usd',
        contentIds: [productId],
        clientIp: req.ip || req.headers['x-forwarded-for']?.toString(),
        clientUserAgent: req.headers['user-agent'],
        fbp: req.cookies?._fbp,
        fbc: req.cookies?._fbc,
      }).catch(e => console.error('Meta CAPI AddToCart error:', e));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/carts/items/:id
 * Change cart item quantity.
 */
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!cartItem) {
      throw new AppError('Cart item not found.', 404);
    }

    // Validate stock if tracked
    let availableStock = cartItem.product.stock;
    let trackStock = cartItem.product.trackStock;

    if (cartItem.productVariantId && cartItem.variant) {
      availableStock = cartItem.variant.stock;
    }

    if (trackStock && availableStock < quantity) {
      throw new AppError(`Insufficient stock. Only ${availableStock} items available.`, 400);
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    res.json({
      success: true,
      data: {
        item: updatedItem,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/carts/items/:id
 * Remove item from cart.
 */
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      throw new AppError('Cart item not found.', 404);
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Cart item removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/carts/merge
 * Merge guest cart into user cart on login.
 */
export const mergeCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required to merge cart.', 401);
    }

    // Find user's active cart or create one
    const userCart = await prisma.cart.findFirst({
      where: { userId },
    }) || await prisma.cart.create({
      data: { userId, sessionId: `sess_${crypto.randomUUID()}` },
    });

    // Find guest cart
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      res.json({
        success: true,
        message: 'No guest items to merge.',
        data: { cart: userCart },
      });
      return;
    }

    // Merge process
    for (const item of guestCart.items) {
      const existingUserItem = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
        },
      });

      if (existingUserItem) {
        // Update quantity
        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: { quantity: existingUserItem.quantity + item.quantity },
        });
      } else {
        // Move item
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { cartId: userCart.id },
        });
      }
    }

    // Delete guest cart
    await prisma.cart.delete({
      where: { id: guestCart.id },
    }).catch(() => {
      // Ignore if already deleted by cascading updates
    });

    // Return fully populated user cart
    const finalCart = await prisma.cart.findUnique({
      where: { id: userCart.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Cart merged successfully.',
      data: {
        cart: finalCart,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { OrderStatus, PaymentStatus, PaymentMethod, Role } from '@prisma/client';
import crypto from 'crypto';
import { hashPassword } from '../lib/password.js';
import { refundPayment } from '../services/stripe.service.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../services/email.service.js';
import { activityService } from '../services/activity.service.js';

/**
 * POST /api/v1/orders
 * Create order from cart. Apply coupon code (if valid), calculate tax, shipping, and verify stock. Deduct stock.
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      sessionId,
      customerEmail,
      customerPhone,
      paymentMethod,
      paymentIntentId,
      shippingAddress,
      billingAddress,
      couponCode,
    } = req.body;
    let userId = req.user?.id || null;

    if (!userId && !sessionId) {
      throw new AppError('Either user authentication or session ID is required to place an order.', 400);
    }

    // Direct Customer Relation: If user is guest/unauthenticated, link to existing user or create customer account
    const emailToLink = customerEmail || shippingAddress?.email || null;
    if (!userId && emailToLink) {
      const normalizedEmail = emailToLink.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        userId = existingUser.id;
        // Update user phone if missing and shipping phone provided
        const phoneToUpdate = customerPhone || shippingAddress?.phone;
        if (!existingUser.phone && phoneToUpdate) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { phone: phoneToUpdate },
          });
        }
      } else {
        // Automatically create a Customer record so all orders have direct relation with customer
        const randomPassword = crypto.randomBytes(10).toString('hex');
        const passwordHash = await hashPassword(randomPassword);
        const newUser = await prisma.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            firstName: shippingAddress?.firstName || null,
            lastName: shippingAddress?.lastName || null,
            phone: customerPhone || shippingAddress?.phone || null,
            role: Role.CUSTOMER,
            isEmailVerified: false,
          },
        });
        userId = newUser.id;
      }
    }

    // 1. Get active cart
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty or not found.', 400);
    }

    // 2. Validate stock for all items
    for (const item of cart.items) {
      let availableStock = item.product.stock;
      let trackStock = item.product.trackStock;

      if (item.productVariantId && item.variant) {
        availableStock = item.variant.stock;
      }

      if (trackStock && availableStock < item.quantity) {
        throw new AppError(`Insufficient stock for product: ${item.product.name}. Only ${availableStock} available.`, 400);
      }
    }

    // 3. Calculate subtotal
    let subtotal = 0;
    const orderItemsData = cart.items.map((item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      const sku = item.variant ? item.variant.sku : item.product.sku;
      const name = item.variant ? `${item.product.name} (${item.variant.name})` : item.product.name;

      subtotal += parseFloat(price.toString()) * item.quantity;

      return {
        productId: item.productId,
        productVariantId: item.productVariantId || null,
        name,
        sku,
        price,
        quantity: item.quantity,
      };
    });

    // 4. Validate Coupon
    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        throw new AppError('Invalid or inactive coupon code.', 400);
      }

      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        throw new AppError('Coupon is expired or not active yet.', 400);
      }

      if (coupon.minOrderValue && subtotal < parseFloat(coupon.minOrderValue.toString())) {
        throw new AppError(`Order subtotal must be at least $${coupon.minOrderValue} to use this coupon.`, 400);
      }

      if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        throw new AppError('Coupon usage limit has been reached.', 400);
      }

      // Calculate discount
      if (coupon.discountType === 'PERCENT') {
        discount = subtotal * (parseFloat(coupon.discountValue.toString()) / 100);
      } else {
        discount = parseFloat(coupon.discountValue.toString());
      }

      // Cap discount at subtotal
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    // 5. Tax & Shipping (e.g. flat tax 10%, shipping $15 or free above $100 after discount)
    const netSubtotal = subtotal - discount;
    const tax = netSubtotal * 0.10; // 10% tax
    const shippingCost = netSubtotal > 100 ? 0 : 15; // Free shipping over $100
    const total = netSubtotal + tax + shippingCost;

    // 6. Generate unique order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randStr}`;

    // 7. Perform DB operations inside a transaction
    const order = await prisma.$transaction(async (tx) => {
      // a. Deduct stock
      for (const item of cart.items) {
        if (item.product.trackStock) {
          if (item.productVariantId && item.variant) {
            await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: {
                stock: { decrement: item.quantity },
              },
            });
            // Keep overall product stock representation up to date
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          }
        }
      }

      // b. Update coupon usage count
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            usageCount: { increment: 1 },
          },
        });
      }

      // c. Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          paymentMethod,
          paymentIntentId: paymentIntentId || null,
          subtotal,
          tax,
          shippingCost,
          discount,
          total,
          couponCode: couponCode || null,
          shippingName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          shippingAddress1: shippingAddress.address1,
          shippingAddress2: shippingAddress.address2 || null,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          shippingPhone: shippingAddress.phone || customerPhone || '',
          billingName: `${billingAddress.firstName} ${billingAddress.lastName}`,
          billingAddress1: billingAddress.address1,
          billingAddress2: billingAddress.address2 || null,
          billingCity: billingAddress.city,
          billingState: billingAddress.state,
          billingPostalCode: billingAddress.postalCode,
          billingCountry: billingAddress.country,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              note: 'Order successfully created',
              updatedBy: req.user?.email || customerEmail || 'CUSTOMER',
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              role: true,
            },
          },
          statusHistory: true,
        },
      });

      // d. Clear Cart items (Cascade delete allows keeping the cart entity empty or deleting it)
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Send order confirmation email
    const recipientEmail = req.user?.email || customerEmail;
    if (recipientEmail) {
      try {
        await sendOrderConfirmationEmail(
          recipientEmail,
          order.shippingName || 'Customer',
          order.orderNumber,
          order.total.toString()
        );
      } catch (err) {
        console.error('Failed to send order confirmation email:', err);
      }
    }

    // Track customer activity
    activityService.trackActivity({
      type: 'PURCHASE',
      userId: order.userId || userId || null,
      sessionId: sessionId || null,
      orderId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        total: parseFloat(order.total.toString()),
        subtotal: parseFloat(order.subtotal.toString()),
        discount: parseFloat(order.discount.toString()),
        couponCode: order.couponCode || null,
        paymentMethod: order.paymentMethod,
        itemCount: order.items?.length || 0,
      },
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
    });

    res.status(201).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders
 * Fetch list of orders. Customers get their own orders; admins see all.
 */
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, paymentStatus, search, startDate, endDate, page = '1', limit = '10' } = req.query;

    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Customers see only their own orders
    if (req.user.role === 'CUSTOMER') {
      where.userId = req.user.id;
    } else {
      // Admins/Support/Marketing filters
      if (status && status !== 'all') {
        where.status = status as OrderStatus;
      }
      if (paymentStatus && paymentStatus !== 'all') {
        where.paymentStatus = paymentStatus as PaymentStatus;
      }
      if (search) {
        const searchStr = String(search).trim();
        where.OR = [
          { orderNumber: { contains: searchStr, mode: 'insensitive' } },
          { shippingName: { contains: searchStr, mode: 'insensitive' } },
          { shippingPhone: { contains: searchStr, mode: 'insensitive' } },
          { billingName: { contains: searchStr, mode: 'insensitive' } },
          { user: { email: { contains: searchStr, mode: 'insensitive' } } },
          { user: { phone: { contains: searchStr, mode: 'insensitive' } } },
          { user: { firstName: { contains: searchStr, mode: 'insensitive' } } },
          { user: { lastName: { contains: searchStr, mode: 'insensitive' } } },
        ];
      }
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              role: true,
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:id
 * Get details of a single order. Customers can view their own; admins can view any.
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    // Role check
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      throw new AppError('You are not authorized to view this order.', 403);
    }

    res.json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/orders/:id/status
 * Admin update order status, track numbers, and append history.
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note, trackingNumber, shippingCarrier } = req.body;

    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    // Update status and append tracking details
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
        shippingCarrier: shippingCarrier !== undefined ? shippingCarrier : undefined,
        statusHistory: {
          create: {
            status,
            note: note || `Order status updated to ${status}`,
            updatedBy: req.user.email,
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    if (updatedOrder.user?.email) {
      try {
        await sendOrderStatusUpdateEmail(
          updatedOrder.user.email,
          updatedOrder.shippingName || 'Customer',
          updatedOrder.orderNumber,
          status
        );
      } catch (err) {
        console.error('Failed to send order status email:', err);
      }
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/orders/:id/refund
 * Refund an order and update status. Admin only.
 */
export const processRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;

    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (order.status === OrderStatus.REFUNDED) {
      throw new AppError('Order has already been refunded.', 400);
    }

    // --- Payment gateway refund logic ---
    let refundNote = reason || 'Order refunded by staff';

    switch (order.paymentMethod) {
      case PaymentMethod.STRIPE: {
        if (order.paymentIntentId) {
          try {
            const stripeRefund = await refundPayment(
              order.paymentIntentId,
              amount // undefined = full refund, number = partial refund
            );
            refundNote += ` | Stripe refund ID: ${stripeRefund.id}`;
          } catch (stripeError: any) {
            throw new AppError(
              `Stripe refund failed: ${stripeError.message || 'Unknown error'}`,
              502
            );
          }
        } else {
          throw new AppError(
            'Cannot process Stripe refund: no payment intent ID found on this order.',
            400
          );
        }
        break;
      }

      case PaymentMethod.PAYPAL: {
        if (order.paymentIntentId) {
          // PayPal checkout-server-sdk does not provide a simple refund API.
          // Refunds for PayPal orders should be processed via the PayPal merchant dashboard
          // or via the PayPal REST API v2 captures refund endpoint directly.
          console.warn(
            `[PayPal Refund] Order ${order.orderNumber}: PayPal refund should be ` +
            `processed via PayPal dashboard. PayPal Order ID: ${order.paymentIntentId}`
          );
          refundNote += ' | PayPal refund must be processed manually via PayPal dashboard';
        } else {
          throw new AppError(
            'Cannot process PayPal refund: no PayPal order ID found on this order.',
            400
          );
        }
        break;
      }

      case PaymentMethod.COD:
      case PaymentMethod.BANK_TRANSFER: {
        // No gateway refund needed — just update the database status
        refundNote += ` | ${order.paymentMethod} order — no gateway refund required`;
        break;
      }

      default: {
        throw new AppError(`Unsupported payment method: ${order.paymentMethod}`, 400);
      }
    }

    // --- Update database status ---
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
        statusHistory: {
          create: {
            status: OrderStatus.REFUNDED,
            note: refundNote,
            updatedBy: req.user.email,
          },
        },
      },
      include: {
        statusHistory: true,
      },
    });

    res.json({
      success: true,
      message: 'Order refunded successfully.',
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};


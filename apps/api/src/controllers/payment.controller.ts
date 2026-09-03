import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { stripe, createPaymentIntent } from '../services/stripe.service.js';
import { capturePayPalOrderService } from '../services/paypal.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { metaCapiService } from '../services/meta-capi.service.js';

/**
 * POST /api/v1/payments/create-intent
 * Creates a Stripe Payment Intent for an active cart or an existing unpaid order.
 */
export const createIntentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, sessionId, couponCode } = req.body;
    const userId = req.user?.id || null;

    let amount = 0;
    let orderToUpdateId: string | null = null;

    if (orderId) {
      // Intent creation for an existing order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new AppError('Order not found.', 404);
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new AppError('Order is already paid.', 400);
      }

      amount = parseFloat(order.total.toString());
      orderToUpdateId = order.id;
    } else {
      // Intent creation for the current active cart
      if (!userId && !sessionId) {
        throw new AppError('Either user authentication or session ID is required to process payment.', 400);
      }

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

      // Calculate totals
      let subtotal = 0;
      for (const item of cart.items) {
        const price = item.variant ? item.variant.price : item.product.price;
        subtotal += parseFloat(price.toString()) * item.quantity;
      }

      let discount = 0;
      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });

        if (coupon && coupon.isActive) {
          const now = new Date();
          if (now >= coupon.startDate && now <= coupon.endDate) {
            if (!coupon.minOrderValue || subtotal >= parseFloat(coupon.minOrderValue.toString())) {
              if (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit) {
                if (coupon.discountType === 'PERCENT') {
                  discount = subtotal * (parseFloat(coupon.discountValue.toString()) / 100);
                } else {
                  discount = parseFloat(coupon.discountValue.toString());
                }
                if (discount > subtotal) {
                  discount = subtotal;
                }
              }
            }
          }
        }
      }

      const netSubtotal = subtotal - discount;
      const tax = netSubtotal * 0.10;
      const shippingCost = netSubtotal > 100 ? 0 : 15;
      amount = netSubtotal + tax + shippingCost;
    }

    if (amount <= 0) {
      throw new AppError('Invalid order/cart total amount.', 400);
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      'usd',
      orderToUpdateId || 'cart'
    );

    // If we have an existing order, update it with the intent ID
    if (orderToUpdateId) {
      await prisma.order.update({
        where: { id: orderToUpdateId },
        data: {
          paymentIntentId: paymentIntent.id,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/webhook
 * Stripe webhook receiver to update order payment statuses asynchronously.
 */
export const webhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: any;

  try {
    // Requires raw request body as Buffer
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Stripe webhook signature verification failed:`, err.message);
    res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    return;
  }

  try {
    console.log(`ℹ️ Stripe webhook event received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        console.log(`💰 Stripe PaymentIntent succeeded: ${paymentIntent.id}`);

        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.PAID,
              status: OrderStatus.PROCESSING,
              statusHistory: {
                create: {
                  status: OrderStatus.PROCESSING,
                  note: 'Payment confirmed via Stripe Webhook',
                  updatedBy: 'STRIPE_WEBHOOK',
                },
              },
            },
          });
          console.log(`✅ Order ${order.id} marked as PAID / PROCESSING`);

          // Fetch full order to dispatch server-side tracking event
          const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { user: true, items: true },
          });

          if (fullOrder) {
            metaCapiService.sendPurchaseEvent({
              eventId: fullOrder.orderNumber,
              email: fullOrder.user?.email || undefined,
              phone: fullOrder.user?.phone || fullOrder.shippingPhone || undefined,
              value: parseFloat(fullOrder.total.toString()),
              currency: 'usd',
              contentIds: fullOrder.items.map(item => item.productId),
              numItems: fullOrder.items.reduce((sum, item) => sum + item.quantity, 0),
            }).catch(e => console.error('Failed to send Meta CAPI purchase event:', e));
          }
        } else {
          console.warn(`⚠️ No order found matching paymentIntentId: ${paymentIntent.id}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        console.log(`❌ Stripe PaymentIntent failed: ${paymentIntent.id}`);

        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.FAILED,
              statusHistory: {
                create: {
                  status: order.status,
                  note: `Payment failed via Stripe: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
                  updatedBy: 'STRIPE_WEBHOOK',
                },
              },
            },
          });
          console.log(`❌ Order ${order.id} marked as FAILED`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        console.log(`💵 Stripe Charge refunded: ${charge.id}`);

        if (charge.payment_intent && typeof charge.payment_intent === 'string') {
          const order = await prisma.order.findFirst({
            where: { paymentIntentId: charge.payment_intent },
          });

          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: PaymentStatus.REFUNDED,
                status: OrderStatus.REFUNDED,
                statusHistory: {
                  create: {
                    status: OrderStatus.REFUNDED,
                    note: 'Order marked as REFUNDED via Stripe Webhook',
                    updatedBy: 'STRIPE_WEBHOOK',
                  },
                },
              },
            });
            console.log(`✅ Order ${order.id} marked as REFUNDED`);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/paypal/capture
 * Captures PayPal order ID and marks the associated order as paid.
 */
export const capturePayPalOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, paypalOrderId } = req.body;

    if (!orderId || !paypalOrderId) {
      throw new AppError('Order ID and PayPal Order ID are required.', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new AppError('Order is already paid.', 400);
    }

    // Real API capture via PayPal SDK
    const captureData = await capturePayPalOrderService(paypalOrderId);

    if (captureData.status !== 'COMPLETED') {
      throw new AppError('PayPal payment capture failed or is pending.', 400);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
        paymentIntentId: paypalOrderId,
        statusHistory: {
          create: {
            status: OrderStatus.PROCESSING,
            note: `Payment successfully captured via PayPal (ID: ${paypalOrderId})`,
            updatedBy: req.user?.email || 'PAYPAL_INTEGRATION',
          },
        },
      },
      include: {
        statusHistory: true,
        user: true,
        items: true,
      },
    });

    metaCapiService.sendPurchaseEvent({
      eventId: updatedOrder.orderNumber,
      email: updatedOrder.user?.email || undefined,
      phone: updatedOrder.user?.phone || updatedOrder.shippingPhone || undefined,
      value: parseFloat(updatedOrder.total.toString()),
      currency: 'usd',
      contentIds: updatedOrder.items.map(item => item.productId),
      numItems: updatedOrder.items.reduce((sum, item) => sum + item.quantity, 0),
    }).catch(e => console.error('Failed to send Meta CAPI purchase event:', e));

    res.status(200).json({
      success: true,
      message: 'PayPal payment captured successfully.',
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/paypal/webhook
 * PayPal webhook receiver.
 */
export const paypalWebhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = req.body;
    
    console.log(`ℹ️ PayPal webhook event received: ${event.event_type}`);

    // In a real production app, you should verify the webhook signature using the PayPal API.
    
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const capture = event.resource;
        console.log(`💰 PayPal Capture completed: ${capture.id}`);
        // Handle background confirmation logic if needed
        break;
      }
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const refund = event.resource;
        console.log(`💵 PayPal Capture refunded: ${refund.id}`);
        
        // Find order by paypalOrderId (stored in paymentIntentId)
        // Note: The refund resource usually has links to the capture ID, which we'd need to map.
        // Assuming we store the capture ID in paymentIntentId for PayPal.
        break;
      }
      default:
        console.log(`ℹ️ Unhandled PayPal event type: ${event.event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

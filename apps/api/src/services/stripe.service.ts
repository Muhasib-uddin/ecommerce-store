import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any,
});

// ==========================================
// Customer Management
// ==========================================

/**
 * Creates a Stripe Customer object.
 * @param email Customer email address.
 * @param name Customer full name.
 * @returns The created Stripe Customer object.
 */
export const createStripeCustomer = async (
  email: string,
  name: string
): Promise<Stripe.Customer> => {
  return await stripe.customers.create({
    email,
    name,
  });
};

// ==========================================
// Setup Intents & Saved Payment Methods
// ==========================================

/**
 * Creates a SetupIntent for saving a card for future use.
 * @param customerId Stripe Customer ID.
 * @returns The created SetupIntent.
 */
export const createSetupIntent = async (
  customerId: string
): Promise<Stripe.SetupIntent> => {
  return await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });
};

/**
 * Lists saved payment methods for a Stripe customer.
 * @param customerId Stripe Customer ID.
 * @returns Array of PaymentMethod objects.
 */
export const listPaymentMethods = async (
  customerId: string
): Promise<Stripe.PaymentMethod[]> => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  return paymentMethods.data;
};

// ==========================================
// Payment Intents
// ==========================================

/**
 * Creates a Stripe Payment Intent (basic — no customer attached).
 * @param amount Amount in standard currency units (e.g., dollars).
 * @param currency Currency code (default: 'usd').
 * @param orderId ID of the associated order.
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  orderId: string
) => {
  // Stripe expects the amount in the smallest currency unit (cents for USD)
  const centsAmount = Math.round(amount * 100);

  return await stripe.paymentIntents.create({
    amount: centsAmount,
    currency,
    metadata: {
      orderId,
    },
  });
};

/**
 * Creates a Stripe Payment Intent with a customer and optional saved payment method.
 * This enables charging saved cards and associating payments with Stripe customers.
 * @param amount Amount in standard currency units (e.g., dollars).
 * @param currency Currency code (default: 'usd').
 * @param orderId ID of the associated order.
 * @param customerId Stripe Customer ID.
 * @param paymentMethodId Optional Stripe PaymentMethod ID to charge a saved card.
 * @returns The created PaymentIntent.
 */
export const createPaymentIntentWithCustomer = async (
  amount: number,
  currency: string = 'usd',
  orderId: string,
  customerId: string,
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent> => {
  const centsAmount = Math.round(amount * 100);

  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount: centsAmount,
    currency,
    customer: customerId,
    metadata: { orderId },
    // Automatically attach the payment method to the customer for future reuse
    setup_future_usage: 'off_session',
  };

  if (paymentMethodId) {
    intentParams.payment_method = paymentMethodId;
    // Confirm immediately when using a saved payment method
    intentParams.confirm = true;
    intentParams.return_url = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  return await stripe.paymentIntents.create(intentParams);
};

// ==========================================
// Refunds
// ==========================================

/**
 * Refunds a Payment Intent. Supports full and partial refunds.
 * @param paymentIntentId Stripe Payment Intent ID.
 * @param amount Optional partial refund amount in standard currency units (e.g., dollars).
 *               If omitted, a full refund is issued.
 * @returns The created Refund object.
 */
export const refundPayment = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount !== undefined) {
    refundParams.amount = Math.round(amount * 100);
  }

  return await stripe.refunds.create(refundParams);
};

// ==========================================
// Webhooks
// ==========================================

/**
 * Constructs and verifies a Stripe webhook event from the raw request body.
 * @param body Raw request body (Buffer or string).
 * @param signature Stripe-Signature header value.
 * @param secret Stripe webhook endpoint signing secret.
 * @returns The verified Stripe Event.
 * @throws Stripe.errors.StripeSignatureVerificationError if verification fails.
 */
export const constructWebhookEvent = (
  body: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(body, signature, secret);
};

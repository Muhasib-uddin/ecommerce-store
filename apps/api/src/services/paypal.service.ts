import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID || 'sb';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'sb';

function environment() {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

export const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(environment());

/**
 * Creates a PayPal order.
 * @param amount Amount in standard currency units.
 * @param currency Currency code (default: 'USD').
 */
export const createPayPalOrder = async (amount: number, currency: string = 'USD') => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      },
    ],
  });

  const response = await paypalClient.execute(request);
  return response.result;
};

/**
 * Captures a PayPal order.
 * @param orderId The PayPal Order ID.
 */
export const capturePayPalOrderService = async (orderId: string) => {
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({} as any);

  const response = await paypalClient.execute(request);
  return response.result;
};

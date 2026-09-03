"use client";

import React, { useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PaymentProvidersProps {
  children: React.ReactNode;
  stripeClientSecret?: string;
}

// Cache the Stripe promise outside the component to avoid re-loading
let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export default function PaymentProviders({
  children,
  stripeClientSecret,
}: PaymentProvidersProps) {
  const stripe = useMemo(() => getStripePromise(), []);
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Build the Stripe Elements options
  const stripeOptions = useMemo(() => {
    if (!stripeClientSecret) return undefined;
    return {
      clientSecret: stripeClientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#6366f1",
          borderRadius: "12px",
          fontFamily: '"Geist", system-ui, -apple-system, sans-serif',
        },
      },
    };
  }, [stripeClientSecret]);

  let content = <>{children}</>;

  // Wrap with PayPalScriptProvider if client ID is available
  if (paypalClientId) {
    content = (
      <PayPalScriptProvider
        options={{
          clientId: paypalClientId,
          currency: "USD",
          intent: "capture",
        }}
      >
        {content}
      </PayPalScriptProvider>
    );
  }

  // Wrap with Stripe Elements if the key is available
  if (stripe) {
    if (stripeClientSecret && stripeOptions) {
      content = (
        <Elements stripe={stripe} options={stripeOptions}>
          {content}
        </Elements>
      );
    } else {
      // Provide Elements without clientSecret - the form won't render until secret is available
      content = (
        <Elements stripe={stripe}>
          {content}
        </Elements>
      );
    }
  }

  return content;
}

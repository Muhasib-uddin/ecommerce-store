"use client";

import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeCardNumberElementChangeEvent } from "@stripe/stripe-js";
import { CreditCard, Lock, AlertCircle, Loader2 } from "lucide-react";

interface StripeCheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

const elementBaseStyle = {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: '"Geist", system-ui, -apple-system, sans-serif',
      fontSmoothing: "antialiased",
      color: "#18181b",
      "::placeholder": {
        color: "#a1a1aa",
      },
      iconColor: "#6366f1",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

const elementDarkStyle = {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: '"Geist", system-ui, -apple-system, sans-serif',
      fontSmoothing: "antialiased",
      color: "#fafafa",
      "::placeholder": {
        color: "#71717a",
      },
      iconColor: "#818cf8",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

export default function StripeCheckoutForm({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardError, setCardError] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string>("unknown");
  const [fieldErrors, setFieldErrors] = useState<{
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
  }>({});

  // Detect dark mode
  const [isDark, setIsDark] = useState(false);
  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const currentStyle = isDark ? elementDarkStyle : elementBaseStyle;

  const handleCardChange = (event: StripeCardNumberElementChangeEvent) => {
    setCardBrand(event.brand || "unknown");
    if (event.error) {
      setFieldErrors((prev) => ({ ...prev, cardNumber: event.error!.message }));
    } else {
      setFieldErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onPaymentError("Payment system is still loading. Please wait a moment.");
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const cardNumberElement = elements.getElement(CardNumberElement);

    if (!cardNumberElement) {
      onPaymentError("Card input could not be found. Please refresh the page.");
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
          },
        }
      );

      if (error) {
        const errorMessage =
          error.message || "An unexpected error occurred during payment.";
        setCardError(errorMessage);
        onPaymentError(errorMessage);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id);
      } else if (
        paymentIntent &&
        paymentIntent.status === "requires_action"
      ) {
        // 3D Secure / SCA — Stripe handles the modal automatically
        // The confirmCardPayment promise resolves after authentication
        setCardError(
          "Additional authentication is required. Please complete the verification."
        );
        setIsProcessing(false);
      } else {
        setCardError("Payment was not completed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      const message = err?.message || "Payment failed. Please try again.";
      setCardError(message);
      onPaymentError(message);
      setIsProcessing(false);
    }
  };

  const brandIcons: Record<string, string> = {
    visa: "💳 Visa",
    mastercard: "💳 Mastercard",
    amex: "💳 Amex",
    discover: "💳 Discover",
    diners: "💳 Diners",
    jcb: "💳 JCB",
    unionpay: "💳 UnionPay",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Input Container */}
      <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <CreditCard className="h-4 w-4 text-indigo-500" />
            <span>Card Details</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <Lock className="h-3 w-3" />
            <span>Secured by Stripe</span>
          </div>
        </div>

        {/* Card Number */}
        <div>
          <label className="flex items-center justify-between mb-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Card Number
            </span>
            {cardBrand !== "unknown" && (
              <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400">
                {brandIcons[cardBrand] || cardBrand.toUpperCase()}
              </span>
            )}
          </label>
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-900 transition-colors focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
            <CardNumberElement
              options={{
                ...currentStyle,
                showIcon: true,
                placeholder: "1234 1234 1234 1234",
              }}
              onChange={handleCardChange}
            />
          </div>
          {fieldErrors.cardNumber && (
            <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.cardNumber}
            </p>
          )}
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Expiration
            </label>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-900 transition-colors focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
              <CardExpiryElement
                options={{
                  ...currentStyle,
                  placeholder: "MM / YY",
                }}
                onChange={(event) => {
                  if (event.error) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      cardExpiry: event.error!.message,
                    }));
                  } else {
                    setFieldErrors((prev) => ({
                      ...prev,
                      cardExpiry: undefined,
                    }));
                  }
                }}
              />
            </div>
            {fieldErrors.cardExpiry && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.cardExpiry}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Security Code
            </label>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-900 transition-colors focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
              <CardCvcElement
                options={{
                  ...currentStyle,
                  placeholder: "CVC",
                }}
                onChange={(event) => {
                  if (event.error) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      cardCvc: event.error!.message,
                    }));
                  } else {
                    setFieldErrors((prev) => ({
                      ...prev,
                      cardCvc: undefined,
                    }));
                  }
                }}
              />
            </div>
            {fieldErrors.cardCvc && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.cardCvc}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {cardError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{cardError}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 text-white font-semibold rounded-full text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:shadow-none"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Payment…</span>
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" />
            <span>Pay Securely</span>
          </>
        )}
      </button>

      {/* Trust Badges */}
      <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600">
        Your payment information is encrypted and processed securely. We never
        store your card details.
      </p>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

interface PayPalCheckoutButtonProps {
  amount: number;
  currency?: string;
  onApprove: (paypalOrderId: string) => void;
  onError: (error: string) => void;
}

export default function PayPalCheckoutButton({
  amount,
  currency = "USD",
  onApprove,
  onError,
}: PayPalCheckoutButtonProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [paypalError, setPaypalError] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Loading PayPal…
          </p>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
        <div className="flex items-start gap-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Failed to load PayPal. Please check your internet connection and try
            again.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PayPal Container */}
      <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.59A.768.768 0 015.7 2h5.09c2.756 0 4.668 1.86 4.258 4.57-.491 3.246-3.12 5.263-6.063 5.263H7.209l-1.3 7.63a.641.641 0 01-.633.536h-.2v.338z"
                fill="#003087"
              />
              <path
                d="M19.35 6.57c-.491 3.246-3.12 5.263-6.063 5.263h-1.776l-1.3 7.63a.641.641 0 01-.633.536H6.876l-.088.512a.641.641 0 00.633.74h3.262a.768.768 0 00.756-.59l1.241-7.271h1.776c2.944 0 5.573-2.017 6.063-5.263.326-2.155-.713-3.788-3.169-4.128.413.674.413 1.582.413 2.571z"
                fill="#0070E0"
              />
            </svg>
            <span>PayPal Checkout</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="h-3 w-3" />
            <span>Buyer Protected</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          You&apos;ll be redirected to PayPal to complete your payment of{" "}
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            ${amount.toFixed(2)} {currency}
          </span>
          . You can pay with your PayPal balance, linked bank account, or card.
        </p>

        {/* PayPal Buttons */}
        <div className="pt-1">
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "gold",
              shape: "pill",
              label: "pay",
              height: 48,
              tagline: false,
            }}
            createOrder={(_data, actions) => {
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: currency,
                      value: amount.toFixed(2),
                    },
                  },
                ],
              });
            }}
            onApprove={async (data, _actions) => {
              setPaypalError(null);
              if (data.orderID) {
                onApprove(data.orderID);
              }
            }}
            onError={(err) => {
              const message =
                err instanceof Error
                  ? err.message
                  : "An error occurred with PayPal. Please try again.";
              setPaypalError(message);
              onError(message);
            }}
            onCancel={() => {
              setPaypalError("Payment was cancelled. You can try again when ready.");
            }}
          />
        </div>
      </div>

      {/* Error Banner */}
      {paypalError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{paypalError}</span>
        </div>
      )}

      {/* Trust */}
      <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600">
        PayPal transactions are protected by PayPal&apos;s Buyer Protection
        program.
      </p>
    </div>
  );
}

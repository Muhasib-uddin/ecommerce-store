"use client";

import React from "react";
import { Landmark, Clock, Copy, Info } from "lucide-react";

const bankDetails = [
  { label: "Account Name", value: "Lumière Stores Ltd." },
  { label: "IBAN", value: "GB82 WEST 1234 5698 7654 32" },
  { label: "SWIFT / BIC", value: "WESTGB2L" },
  { label: "Bank Name", value: "Western National Bank" },
  { label: "Reference", value: "Will be provided after order placement" },
];

export default function BankTransferInfo() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, "")).catch(() => {
      // Silently fail — clipboard API may not be available in all contexts
    });
  };

  return (
    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
          <Landmark className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Bank Transfer
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Direct wire transfer to our account
          </p>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {bankDetails.map((detail) => (
          <div
            key={detail.label}
            className="flex items-center justify-between px-4 py-2.5 group"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {detail.label}
              </span>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {detail.value}
              </p>
            </div>
            {!detail.value.includes("provided") && (
              <button
                type="button"
                onClick={() => handleCopy(detail.value)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                title={`Copy ${detail.label}`}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
          <Clock className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
          <span>
            Please complete the bank transfer within{" "}
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              48 hours
            </span>{" "}
            of placing your order. Orders not paid within this window will be
            automatically cancelled.
          </span>
        </div>

        <div className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500" />
          <span>
            Use your order number as the payment reference. Final bank details
            and the exact reference code will be provided in your confirmation
            email.
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
          The bank details shown above are placeholder values. Actual account
          information will be provided upon order confirmation based on your
          store&apos;s configured payment settings.
        </p>
      </div>
    </div>
  );
}

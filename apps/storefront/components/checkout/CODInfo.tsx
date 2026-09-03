"use client";

import React from "react";
import { Banknote, CheckCircle2, Info, Truck } from "lucide-react";

export default function CODInfo() {
  return (
    <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <Banknote className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
            Cash on Delivery
          </h4>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Pay when your order arrives
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 text-sm text-emerald-800 dark:text-emerald-300">
          <Truck className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
          <span>
            Our courier will collect payment in cash at the time of delivery.
            Please have the exact amount ready.
          </span>
        </div>

        <div className="flex items-start gap-2.5 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
          <span>
            No upfront payment or card details required. Your order will be
            confirmed immediately.
          </span>
        </div>

        <div className="flex items-start gap-2.5 text-sm text-emerald-800 dark:text-emerald-300">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
          <span>
            A small COD handling fee may apply depending on your delivery
            location. This will be shown in your order summary.
          </span>
        </div>
      </div>

      {/* Note */}
      <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-900/30">
        <p className="text-[11px] text-emerald-600/80 dark:text-emerald-500 leading-relaxed">
          Orders placed with Cash on Delivery are subject to verification. We
          reserve the right to contact you for order confirmation before
          dispatching.
        </p>
      </div>
    </div>
  );
}

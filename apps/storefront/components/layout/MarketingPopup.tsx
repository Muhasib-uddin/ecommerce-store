"use client";

import { useState, useEffect } from "react";
import { X, Tag, Check, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export interface PopupConfig {
  title: string;
  subtitle: string;
  image?: string;
  couponCode?: string;
  active: boolean;
  theme?: string;
  triggerTimeDelay?: boolean;
  timeDelaySeconds?: number;
  triggerExitIntent?: boolean;
}

export function MarketingPopup() {
  const [popup, setPopup] = useState<PopupConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadPopup() {
      try {
        const response = await api.get<{ success: boolean; data: { popup: PopupConfig | null } }>("/cms/popups");
        if (response.success && response.data?.popup && response.data.popup.active) {
          const config = response.data.popup;
          setPopup(config);

          const dismissed = sessionStorage.getItem("popup_dismissed");
          if (!dismissed) {
            const delay = (config.timeDelaySeconds || 4) * 1000;
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, delay);

            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        // Silently skip if popups unavailable
      }
    }

    loadPopup();
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("popup_dismissed", "true");
    setIsOpen(false);
  };

  const handleCopyCoupon = () => {
    if (popup?.couponCode) {
      navigator.clipboard.writeText(popup.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    }
  };

  if (!isOpen || !popup || !popup.active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white backdrop-blur-md shadow-sm transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Image Header */}
        {popup.image && (
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-zinc-900">
            <img
              src={popup.image}
              alt={popup.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-black/30" />
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Exclusive Offer</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            {popup.title}
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {popup.subtitle}
          </p>

          {/* Coupon Code Pill */}
          {popup.couponCode && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-dashed border-indigo-500 font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{popup.couponCode}</span>
              </div>
              <button
                onClick={handleCopyCoupon}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : null}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          )}

          {/* Newsletter Form */}
          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-sm font-semibold border border-emerald-200 dark:border-emerald-900">
              🎉 Welcome to the club! Your discount is ready to use.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email for the discount"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 text-center rounded-full text-sm border border-zinc-300 bg-white focus:outline-none focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <button
                type="submit"
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-white font-bold rounded-full text-sm transition-all shadow-lg shadow-indigo-500/10"
              >
                Claim Your Discount
              </button>
            </form>
          )}

          <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
            By submitting, you agree to receive promotional updates. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

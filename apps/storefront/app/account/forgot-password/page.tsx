"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldAlert, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const { storeName, lightLogo, darkLogo } = useSettings();
  const activeLogo = lightLogo || darkLogo;

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }

    try {
      const msg = await forgotPassword(email.trim());
      setSubmitted(true);
      setSuccessMessage(msg);
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 w-full flex-1 flex flex-col justify-center">
      <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl space-y-6">
        
        {/* Header Title & Brand Logo */}
        <div className="text-center space-y-2">
          {activeLogo && (
            <div className="flex justify-center mb-2">
              <img
                src={activeLogo}
                alt={storeName}
                className="h-8 max-w-[160px] object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Forgot Password
          </h1>
          <p className="text-xs text-zinc-500">
            Enter your account email address to receive a secure password reset link.
          </p>
        </div>

        {/* Global Error Banner */}
        {(error || localError) && !submitted && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs space-y-2 border border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="leading-relaxed">
                {successMessage || "If an account matches that email address, a password reset link has been sent to your inbox."}
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                Please check your inbox and spam folder. The reset link is valid for 1 hour.
              </p>
            </div>

            <Link
              href="/account/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-full text-xs transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20 disabled:opacity-50"
            >
              <span>{isLoading ? "Sending..." : "Send Reset Link"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-zinc-150 dark:border-zinc-900">
          <p className="text-xs text-zinc-500">
            Remembered your password?{" "}
            <Link href="/account/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

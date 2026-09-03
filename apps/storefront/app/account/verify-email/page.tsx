"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { verifyEmail, resendVerification, isLoading, error, clearError, user } = useAuth();
  const { storeName, lightLogo, darkLogo } = useSettings();
  const activeLogo = lightLogo || darkLogo;

  const [verified, setVerified] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendEmail, setResendEmail] = useState(user?.email || "");
  const [resendSent, setResendSent] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    clearError();
    if (token && !hasAttempted) {
      setHasAttempted(true);
      verifyEmail(token)
        .then((msg) => {
          setVerified(true);
          setSuccessMessage(msg);
        })
        .catch(() => {
          setVerified(false);
        });
    }
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    try {
      const msg = await resendVerification(resendEmail.trim());
      setResendSent(true);
      setResendMessage(msg);
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
            Email Verification
          </h1>
        </div>

        {/* Verification Status */}
        {isLoading && !verified ? (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs text-zinc-500">Verifying your token...</p>
          </div>
        ) : verified ? (
          <div className="space-y-5">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs space-y-2 border border-emerald-200 dark:border-emerald-900/40 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h2 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">Email Verified Successfully</h2>
              <p className="leading-relaxed">
                {successMessage || "Your email address has been confirmed. You now have full access to your account."}
              </p>
            </div>

            <Link
              href="/account/profile"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20"
            >
              <span>Go to My Profile</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-zinc-500 text-center">
                Need a new verification link? Enter your email address below to receive one:
              </p>

              {resendSent ? (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300 rounded-xl text-xs text-center border border-indigo-200 dark:border-indigo-900/40">
                  {resendMessage || "A fresh verification link has been sent to your email."}
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                    <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-full text-xs transition-colors"
                  >
                    <span>{isLoading ? "Sending..." : "Resend Verification Link"}</span>
                  </button>
                </form>
              )}
            </div>

            <div className="text-center pt-2 border-t border-zinc-150 dark:border-zinc-900">
              <Link href="/account/login" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Return to Sign In
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-zinc-400">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ShieldAlert, CheckCircle2, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { resetPassword, isLoading, error, clearError } = useAuth();
  const { storeName, lightLogo, darkLogo } = useSettings();
  const activeLogo = lightLogo || darkLogo;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    clearError();
  }, []);

  const hasMinLength = newPassword.length >= 8;
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!token) {
      setLocalError("Missing password reset token. Please request a new link.");
      return;
    }

    if (!isPasswordValid) {
      setLocalError("Password must meet all complexity requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      const msg = await resetPassword({ token, newPassword });
      setIsSuccess(true);
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
            Create New Password
          </h1>
          <p className="text-xs text-zinc-500">
            Please choose a secure new password for your account.
          </p>
        </div>

        {/* Global Error Banner */}
        {(error || localError) && !isSuccess && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs space-y-2 border border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Password Reset Complete</span>
              </div>
              <p className="leading-relaxed">
                {successMessage || "Your password has been reset successfully. You can now log in."}
              </p>
            </div>

            <Link
              href="/account/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
                <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
              </div>
            </div>

            {/* Password Validation Indicators */}
            {newPassword && (
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                  {hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                  {hasLower ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                  {hasUpper ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                  {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  <span>Number</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
                <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20 disabled:opacity-50"
            >
              <span>{isLoading ? "Updating Password..." : "Reset Password"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-zinc-150 dark:border-zinc-900">
          <p className="text-xs text-zinc-500">
            Remember your credentials?{" "}
            <Link href="/account/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-zinc-400">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

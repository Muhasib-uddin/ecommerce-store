"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldAlert, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2FALogin, socialLogin, user, isAuthenticated, requires2FA, reset2FAState, error, clearError, isLoading } = useAuth();
  const { storeName, lightLogo, darkLogo } = useSettings();
  const activeLogo = lightLogo || darkLogo;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    // If already authenticated, redirect to account profile
    if (isAuthenticated && user) {
      router.push("/account/profile");
    }
    clearError();
  }, [isAuthenticated, user]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError("Please enter both email and password.");
      return;
    }

    try {
      const res = await login({ email, password });
      if (res.user) {
        router.push("/account/profile");
      }
    } catch {
      // Error handled in store
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!twoFactorCode.trim()) {
      setLocalError("Please enter your 2FA code.");
      return;
    }

    try {
      await verify2FALogin(twoFactorCode.trim());
      router.push("/account/profile");
    } catch {
      // Error handled in store
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError("");
    clearError();
    try {
      // Multi-provider demo / google oauth bridge
      const demoEmail = email.trim() || "demo.customer@google.com";
      await socialLogin({
        provider: "google",
        email: demoEmail,
        firstName: "Google",
        lastName: "User",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      });
      router.push("/account/profile");
    } catch {
      // Error handled in store
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
            {requires2FA ? "Two-Factor Verification" : `Sign In to ${storeName || "LUMIÈRE"}`}
          </h1>
          <p className="text-xs text-zinc-500">
            {requires2FA
              ? (isUsingBackupCode
                  ? "Enter one of your emergency backup recovery codes (e.g. A1B2-C3D4)."
                  : "Enter the 6-digit code from your authenticator app.")
              : "Welcome back. Please input your credentials below."}
          </p>
        </div>

        {/* Global Error Banner */}
        {(error || localError) && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {requires2FA ? (
          /* 2FA Challenge Form */
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {isUsingBackupCode ? "Backup Recovery Code" : "6-Digit Authenticator Code"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsUsingBackupCode(!isUsingBackupCode);
                    setTwoFactorCode("");
                    clearError();
                  }}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isUsingBackupCode ? "Use Authenticator App" : "Use Backup Code"}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={isUsingBackupCode ? "XXXX-XXXX" : "123456"}
                  maxLength={isUsingBackupCode ? 12 : 6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full text-center text-lg font-mono tracking-widest border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
                <KeyRound className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20 disabled:opacity-50"
            >
              <span>{isLoading ? "Verifying..." : "Verify & Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={reset2FAState}
              className="flex items-center justify-center gap-1 w-full py-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to password login</span>
            </button>
          </form>
        ) : (
          /* Standard Credentials Form */
          <>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <Link
                    href="/account/forgot-password"
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                  />
                  <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20 disabled:opacity-50"
              >
                <span>{isLoading ? "Signing in..." : "Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 w-full py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-xs transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.55 0 2.94.57 4.04 1.5l3.03-3.03C17.24 1.7 14.8 1 12 1 7.37 1 3.44 3.66 1.54 7.51l3.66 2.84C6.07 7.35 8.79 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.66 2.84c2.14-1.97 3.76-4.91 3.76-8.66z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.2 14.65c-.23-.68-.36-1.41-.36-2.15s.13-1.47.36-2.15L1.54 7.51C.56 9.47 0 11.68 0 12s.56 2.53 1.54 4.49l3.66-2.84z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.66-2.84c-1.08.72-2.45 1.16-4.27 1.16-3.21 0-5.93-2.35-6.8-5.35L1.54 16.49C3.44 20.34 7.37 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        <div className="text-center pt-2 border-t border-zinc-150 dark:border-zinc-900">
          <p className="text-xs text-zinc-500">
            Don't have an account?{" "}
            <Link href="/account/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

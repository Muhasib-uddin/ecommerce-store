"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  LogOut,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Mail,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    updateProfile,
    resendVerification,
    setup2FA,
    verify2FA,
    disable2FA,
    logout,
    isLoading,
    fetchMe,
  } = useAuth();

  // Profile Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState("");
  const [errFeedback, setErrFeedback] = useState("");

  // Verification state
  const [resendStatus, setResendStatus] = useState("");
  const [isResending, setIsResending] = useState(false);

  // 2FA state
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeUrl: string;
  } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [twoFactorFeedback, setTwoFactorFeedback] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");

  // Disable 2FA modal state
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  useEffect(() => {
    fetchMe().then((u) => {
      if (!u) {
        router.push("/account/login");
      } else {
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setPhone(u.phone || "");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");
    setErrFeedback("");

    if (!firstName.trim()) {
      setErrFeedback("First name is required.");
      return;
    }

    try {
      await updateProfile({ firstName, lastName, phone });
      setFeedback("Your profile has been updated successfully.");
      setTimeout(() => setFeedback(""), 4000);
    } catch (err: any) {
      setErrFeedback(err.message || "Failed to update profile coordinates.");
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setIsResending(true);
    setResendStatus("");
    try {
      const msg = await resendVerification(user.email);
      setResendStatus(msg || "Verification link sent. Please check your inbox.");
      setTimeout(() => setResendStatus(""), 6000);
    } catch (err: any) {
      setResendStatus(err.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleStart2FASetup = async () => {
    setTwoFactorError("");
    setTwoFactorFeedback("");
    setBackupCodes([]);
    try {
      const data = await setup2FA();
      setTwoFactorData(data);
      setIsSettingUp2FA(true);
    } catch (err: any) {
      setTwoFactorError(err.message || "Failed to initiate 2FA setup.");
    }
  };

  const handleVerify2FASetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError("");
    if (!twoFactorCode.trim() || twoFactorCode.trim().length !== 6) {
      setTwoFactorError("Please enter the 6-digit code from your authenticator app.");
      return;
    }

    try {
      const res = await verify2FA(twoFactorCode.trim());
      setBackupCodes(res.backupCodes || []);
      setTwoFactorFeedback("Two-Factor Authentication is now active on your account!");
      setIsSettingUp2FA(false);
      setTwoFactorData(null);
      setTwoFactorCode("");
    } catch (err: any) {
      setTwoFactorError(err.message || "Invalid 2FA code. Please try again.");
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError("");
    if (!disablePassword.trim()) {
      setTwoFactorError("Please enter your current password.");
      return;
    }

    try {
      await disable2FA(disablePassword.trim());
      setIsDisabling2FA(false);
      setDisablePassword("");
      setTwoFactorFeedback("Two-Factor Authentication has been disabled.");
      setTimeout(() => setTwoFactorFeedback(""), 4000);
    } catch (err: any) {
      setTwoFactorError(err.message || "Failed to disable 2FA. Verify your password.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center text-sm text-zinc-500">
        Loading account details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-10">
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          My Account
        </h1>
        <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
          Manage your personal details, security credentials, and account preferences.
        </p>
      </div>

      {/* Email Verification Status Banner */}
      {!user.isEmailVerified && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Your email address is not verified
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Please verify your email to ensure account security and receive order confirmations.
              </p>
            </div>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      )}

      {resendStatus && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-900/40">
          {resendStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SUB NAVIGATION TAB BAR (3 cols) */}
        <aside className="lg:col-span-3 space-y-2 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
          <Link
            href="/account/profile"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
          >
            <User className="h-4.5 w-4.5" />
            <span>Profile Settings</span>
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
          >
            <Package className="h-4.5 w-4.5" />
            <span>Order History</span>
          </Link>
          <Link
            href="/account/addresses"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
          >
            <MapPin className="h-4.5 w-4.5" />
            <span>Saved Addresses</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 w-full text-left mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* SETTINGS PANELS (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* PROFILE FORM PANEL */}
          <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3">
              Profile Information
            </h2>

            {feedback && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>{feedback}</span>
              </div>
            )}

            {errFeedback && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5" />
                <span>{errFeedback}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                  />
                  <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20 disabled:opacity-50"
              >
                {isLoading ? "Saving changes..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* TWO-FACTOR AUTHENTICATION SECURITY PANEL */}
          <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Two-Factor Authentication (2FA)</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Protect your account with standard TOTP authenticator apps (Google Authenticator, Authy, 1Password).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {user.twoFactorEnabled ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-900/50">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full">
                    Disabled
                  </span>
                )}
              </div>
            </div>

            {twoFactorFeedback && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>{twoFactorFeedback}</span>
              </div>
            )}

            {twoFactorError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5" />
                <span>{twoFactorError}</span>
              </div>
            )}

            {/* Generated Backup Codes Display */}
            {backupCodes.length > 0 && (
              <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                  <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Your Emergency Backup Recovery Codes</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Save these codes in a secure password manager. If you lose access to your authenticator app, each code can be used once to log in:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs font-bold text-center bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Setup 2FA Flow */}
            {isSettingUp2FA && twoFactorData ? (
              <div className="p-6 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 space-y-6 max-w-xl">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Step 1: Scan QR Code with Authenticator App
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={twoFactorData.qrCodeUrl}
                    alt="2FA QR Code"
                    className="w-36 h-36 rounded-lg border border-zinc-100 dark:border-zinc-800 shrink-0"
                  />
                  <div className="space-y-2 text-xs">
                    <p className="text-zinc-500">Or manually enter this secret into your app:</p>
                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800">
                      <span className="break-all">{twoFactorData.secret}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(twoFactorData.secret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="p-1 hover:text-zinc-900 dark:hover:text-white shrink-0"
                      >
                        {copiedSecret ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerify2FASetup} className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Step 2: Enter the 6-digit confirmation code
                  </h3>
                  <div className="max-w-xs">
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="w-full text-center text-lg font-mono tracking-widest border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-xs transition-colors"
                    >
                      {isLoading ? "Activating..." : "Confirm & Enable 2FA"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingUp2FA(false);
                        setTwoFactorData(null);
                      }}
                      className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : isDisabling2FA ? (
              /* Disable 2FA Flow */
              <form onSubmit={handleDisable2FA} className="p-6 border border-red-200 dark:border-red-900/40 rounded-2xl bg-red-50/30 dark:bg-red-950/10 space-y-4 max-w-xl">
                <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                  Disable Two-Factor Authentication
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Please enter your account password to confirm disabling 2FA protection.
                </p>

                <div className="max-w-xs">
                  <input
                    type="password"
                    required
                    placeholder="Account password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-xs transition-colors"
                  >
                    {isLoading ? "Disabling..." : "Confirm Disable 2FA"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDisabling2FA(false)}
                    className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Default 2FA State */
              <div>
                {user.twoFactorEnabled ? (
                  <button
                    onClick={() => setIsDisabling2FA(true)}
                    className="px-5 py-2.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold rounded-full text-xs transition-colors"
                  >
                    Disable Two-Factor Authentication
                  </button>
                ) : (
                  <button
                    onClick={handleStart2FASetup}
                    className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 font-semibold rounded-full text-xs transition-colors flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Setup Two-Factor Authentication</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

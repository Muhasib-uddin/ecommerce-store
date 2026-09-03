"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, ShieldAlert, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isAuthenticated, error, clearError, isLoading } = useAuth();
  const { storeName, lightLogo, darkLogo } = useSettings();
  const activeLogo = lightLogo || darkLogo;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/account/profile");
    }
    clearError();
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email.trim() || !password.trim() || !firstName.trim()) {
      setLocalError("Email, First Name, and Password are required fields.");
      return;
    }

    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setLocalError("Password must be at least 8 characters and include uppercase, lowercase, and numbers.");
      return;
    }

    try {
      await register({
        email,
        password,
        firstName,
        lastName: lastName || undefined,
        phone: phone || undefined,
      });
      router.push("/account/profile");
    } catch (err: any) {
      // errors handled by auth store
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
            Create {storeName ? `${storeName} Account` : "Account"}
          </h1>
          <p className="text-xs text-zinc-500">
            Sign up to unlock order tracking and checkout preferences.
          </p>
        </div>

        {/* Errors Block */}
        {(error || localError) && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-9 bg-transparent text-zinc-900 dark:text-white"
                />
                <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white"
              />
              <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white"
              />
              <Phone className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 bg-transparent text-zinc-900 dark:text-white"
              />
              <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-zinc-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-indigo-950/20"
          >
            <span>{isLoading ? "Creating account..." : "Sign Up"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-150 dark:border-zinc-900">
          <p className="text-xs text-zinc-500">
            Already have an account?{" "}
            <Link href="/account/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Log In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

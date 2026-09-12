"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, LogOut, CheckCircle2, Home, Edit, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AddressesPage() {
  const router = useRouter();
  const { user, fetchMe, logout, isLoading } = useAuth();

  // Address State
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "Sarah",
    lastName: "Taylor",
    address1: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    postalCode: "62704",
    country: "United States",
    phone: "555-0199",
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: "Sarah",
    lastName: "Taylor",
    address1: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    postalCode: "62704",
    country: "United States",
    phone: "555-0199",
  });

  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchMe().then((u) => {
      if (!u) {
        router.push("/account/login");
      }
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingShipping(false);
    setFeedback("Saved shipping address changes.");
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingBilling(false);
    setFeedback("Saved billing address changes.");
    setTimeout(() => setFeedback(""), 3000);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center text-sm text-zinc-500">
        Syncing account details...
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
          Manage your personal details, credentials, and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SUB NAVIGATION TAB BAR */}
        <aside className="lg:col-span-3 space-y-2 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
          <Link
            href="/account/profile"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
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
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
          >
            <MapPin className="h-4.5 w-4.5" />
            <span>Saved Addresses</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 w-full text-left mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* ADDRESSES PANEL (9 cols) */}
        <div className="lg:col-span-9 p-8 border border-zinc-250/70 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3">
            Saved Addresses
          </h2>

          {feedback && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>{feedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SHIPPING ADDRESS */}
            <div className="border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-indigo-500" />
                  <span>Default Shipping</span>
                </span>
                {!isEditingShipping && (
                  <button
                    onClick={() => setIsEditingShipping(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingShipping ? (
                <form onSubmit={handleSaveShipping} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                    />
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                    />
                  </div>
                  <input
                    type="text"
                    value={shippingAddress.address1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                    className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full col-span-2"
                    />
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                    />
                  </div>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold flex items-center gap-1 scale-95"
                    >
                      <Check className="h-3 w-3" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingShipping(false)}
                      className="px-4 py-2 border rounded-full font-semibold scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                  <p>{shippingAddress.address1}</p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                  <p className="mt-2 text-xs text-zinc-400">Phone: {shippingAddress.phone}</p>
                </div>
              )}
            </div>

            {/* BILLING ADDRESS */}
            <div className="border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-indigo-500" />
                  <span>Default Billing</span>
                </span>
                {!isEditingBilling && (
                  <button
                    onClick={() => setIsEditingBilling(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingBilling ? (
                <form onSubmit={handleSaveBilling} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={billingAddress.firstName}
                      onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                    />
                    <input
                      type="text"
                      value={billingAddress.lastName}
                      onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                    />
                  </div>
                  <input
                    type="text"
                    value={billingAddress.address1}
                    onChange={(e) => setBillingAddress({ ...billingAddress, address1: e.target.value })}
                    className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full col-span-2"
                    />
                    <input
                      type="text"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                      className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                    />
                  </div>
                  <input
                    type="text"
                    value={billingAddress.postalCode}
                    onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                    className="border border-zinc-200 dark:border-zinc-805 rounded p-2 bg-transparent text-zinc-900 dark:text-white w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold flex items-center gap-1 scale-95"
                    >
                      <Check className="h-3 w-3" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBilling(false)}
                      className="px-4 py-2 border rounded-full font-semibold scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {billingAddress.firstName} {billingAddress.lastName}
                  </p>
                  <p>{billingAddress.address1}</p>
                  <p>
                    {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                  </p>
                  <p>{billingAddress.country}</p>
                  <p className="mt-2 text-xs text-zinc-400">Phone: {billingAddress.phone}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


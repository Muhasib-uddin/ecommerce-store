"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Tag, Percent, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotals } = useCart();
  const { subtotal, tax, shipping, total, itemsCount } = getTotals();

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();

    if (code === "PREMIUM20" || code === "LUMIERE20") {
      setDiscountValue(subtotal * 0.2); // 20% discount
      setCouponApplied(code);
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon code. Try 'LUMIERE20'");
    }
  };

  const finalTotal = Math.max(0, total - discountValue);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-10">
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Shopping Bag
        </h1>
        <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
          Review your items, apply promo codes, and proceed to shipping.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <ShoppingBag className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4 stroke-1" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Your bag is currently empty</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px]">
            Once you add premium styles, they will be displayed here for checkout.
          </p>
          <Link
            href="/shop"
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-xs text-sm"
          >
            Explore collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ITEMS LIST (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
              const displayImage = item.variant?.imageUrl || (item.product.images?.length > 0 ? item.product.images[0].url : "/placeholder.png");

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-zinc-250/70 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-900/10 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0">
                      <img src={displayImage} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white hover:text-indigo-600">
                        <Link href={`/product/${item.product.slug}`}>{item.product.name}</Link>
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-zinc-500 mt-0.5">Option: {item.variant.name}</p>
                      )}
                      <p className="text-xs text-zinc-450 mt-1 font-mono">SKU: {item.variant?.sku || `PROD-${item.product.id.substring(0, 5)}`}</p>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex sm:flex-row items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Quantity Counters */}
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-full py-1 px-1.5 bg-zinc-50 dark:bg-zinc-900">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-indigo-650 text-zinc-500 disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-indigo-650 text-zinc-500"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price & Trash */}
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-sm w-20 text-right text-zinc-950 dark:text-white">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUMMARY & CHECKOUT COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Promo Code Form */}
            <div className="p-6 rounded-2xl border border-zinc-250/70 bg-white dark:border-zinc-850 dark:bg-zinc-900/10 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-500" />
                <span>Promo Code</span>
              </h3>
              {couponApplied ? (
                <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5" />
                    <span>Applied code: {couponApplied}</span>
                  </span>
                  <button
                    onClick={() => {
                      setCouponApplied("");
                      setDiscountValue(0);
                    }}
                    className="underline hover:text-indigo-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter LUMIERE20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 text-sm border border-zinc-200 dark:border-zinc-800 rounded-full px-3.5 py-2 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-650"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{couponError}</p>}
            </div>

            {/* Calculations and Actions */}
            <div className="p-6 rounded-2xl border border-zinc-250/70 bg-white dark:border-zinc-850 dark:bg-zinc-900/10 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-sm pt-2">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount (20%)</span>
                    <span className="font-semibold">-${discountValue.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {shipping === 0 ? "Free Shipping" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Sales Tax (8%)</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <span>Total</span>
                  <span className="text-lg">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2.5 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg shadow-indigo-950/20"
                >
                  <span>Proceed to Shipping</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

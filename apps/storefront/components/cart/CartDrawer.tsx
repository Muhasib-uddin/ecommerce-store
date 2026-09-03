"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotals, initialize } = useCart();
  const { subtotal, itemsCount } = getTotals();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md transform transition-transform duration-300 ease-out bg-white dark:bg-zinc-950 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <span>Shopping Cart ({itemsCount})</span>
            </h2>
            <button
              onClick={onClose}
              className="rounded-md text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4 stroke-1" />
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">Your cart is empty</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px]">
                  Add some luxury products to your bag to get started.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-sm rounded-full transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
                const comparePrice = item.variant ? Number(item.variant.price) : Number(item.product.compareAtPrice);
                const displayImage = item.variant?.imageUrl || (item.product.images?.length > 0 ? item.product.images[0].url : "/placeholder.png");

                return (
                  <div key={item.id} className="flex py-2 border-b border-zinc-100 dark:border-zinc-900 pb-6 last:border-0 last:pb-0">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      {displayImage.startsWith("http") || displayImage.startsWith("/") ? (
                        <img
                          src={displayImage}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          <h3 className="line-clamp-1">
                            <Link href={`/product/${item.product.slug}`} onClick={onClose} className="hover:text-indigo-600">
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="ml-4 font-semibold">{formatPrice(price)}</p>
                        </div>
                        {item.variant && (
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Option: {item.variant.name}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-full py-0.5 px-1 bg-zinc-50 dark:bg-zinc-900">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-indigo-600 text-zinc-500"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-indigo-600 text-zinc-500"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal and Actions */}
          {items.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-6 bg-zinc-50 dark:bg-zinc-950/50">
              <div className="flex justify-between text-base font-medium text-zinc-900 dark:text-zinc-100">
                <p>Subtotal</p>
                <p className="text-xl font-bold">{formatPrice(subtotal)}</p>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-transparent rounded-full shadow-xs text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-center w-full px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-full text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  View Shopping Bag
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

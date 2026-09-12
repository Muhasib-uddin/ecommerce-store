"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, LogOut, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const MOCK_ORDERS = [
  {
    id: "ord-mock-1",
    orderNumber: "ORD-2026-89472",
    createdAt: "2026-05-18T14:32:00Z",
    total: 370.0,
    status: "PROCESSING",
    paymentMethod: "STRIPE",
    shippingAddress: {
      firstName: "Sarah",
      lastName: "Taylor",
      address1: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      postalCode: "62704",
      phone: "555-0199",
    },
    items: [
      {
        id: "item-1",
        quantity: 2,
        price: 185.0,
        product: { name: "Classic Cashmere Sweater", slug: "classic-cashmere-sweater" },
        variant: { name: "Heather Grey / S" },
      },
    ],
  },
  {
    id: "ord-mock-2",
    orderNumber: "ORD-2026-32401",
    createdAt: "2026-04-12T09:15:00Z",
    total: 160.0,
    status: "DELIVERED",
    paymentMethod: "COD",
    shippingAddress: {
      firstName: "Sarah",
      lastName: "Taylor",
      address1: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      postalCode: "62704",
      phone: "555-0199",
    },
    items: [
      {
        id: "item-2",
        quantity: 1,
        price: 65.0,
        product: { name: "Aroma Diffuser & Humidifier", slug: "aroma-diffuser-humidifier" },
        variant: null,
      },
      {
        id: "item-3",
        quantity: 1,
        price: 95.0,
        product: { name: "Hand-Blown Glass Vase", slug: "hand-blown-glass-vase" },
        variant: null,
      },
    ],
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, fetchMe, logout } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((u) => {
      if (!u) {
        router.push("/account/login");
      } else {
        loadOrders();
      }
    });
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: any[] }>("/orders");
      if (response.success && response.data?.length > 0) {
        setOrders(response.data);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (err) {
      console.warn("Could not load database orders, serving mock orders history", err);
      setOrders(MOCK_ORDERS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusStepIndex = (status: string) => {
    const idx = STATUS_STEPS.indexOf(status.toUpperCase());
    return idx === -1 ? 0 : idx; // PENDING as fallback
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
        {/* SUB NAVIGATION TAB BAR (3 cols) */}
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
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
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
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 w-full text-left mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* ORDER HISTORY LIST PANEL (9 cols) */}
        <div className="lg:col-span-9 p-8 border border-zinc-250/70 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3">
            Order History
          </h2>

          {isLoading ? (
            <div className="text-center py-10 text-sm text-zinc-400 animate-pulse">
              Syncing transaction receipts database...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="h-10 w-10 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No orders found</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Once you place order credentials in our checkout system, your receipt blocks will display here.
              </p>
              <Link
                href="/shop"
                className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                const activeIndex = getStatusStepIndex(order.status);
                
                return (
                  <div
                    key={order.id}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/20 dark:bg-zinc-950/20"
                  >
                    {/* Header bar summary */}
                    <div
                      onClick={() => toggleExpand(order.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs flex-1">
                        <div>
                          <p className="text-zinc-400 font-bold uppercase tracking-wide">Order Number</p>
                          <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 font-bold uppercase tracking-wide">Date Placed</p>
                          <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-400 font-bold uppercase tracking-wide">Total Price</p>
                          <p className="font-bold text-zinc-900 dark:text-white mt-0.5">${Number(order.total).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 font-bold uppercase tracking-wide">Status</p>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase mt-0.5 ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end items-center">
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                      </div>
                    </div>

                    {/* Detailed Accordion Content */}
                    {isExpanded && (
                      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6">
                        
                        {/* STEPPER STATUS GRAPHICS */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Shipment Journey Tracking
                          </h4>
                          <div className="flex items-center justify-between max-w-xl">
                            {STATUS_STEPS.map((step, idx) => {
                              const isCompleted = idx <= activeIndex;
                              const isActive = idx === activeIndex;

                              return (
                                <div key={step} className="flex flex-col items-center flex-1 relative group">
                                  {/* Connector line */}
                                  {idx > 0 && (
                                    <div className={`absolute top-3 left-[-50%] right-[50%] h-0.5 -z-10 ${
                                      idx <= activeIndex ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"
                                    }`} />
                                  )}
                                  
                                  {/* Circle node */}
                                  <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                                    isCompleted
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                  } ${isActive ? "ring-4 ring-indigo-500/15" : ""}`}>
                                    {idx + 1}
                                  </div>
                                  <span className={`text-[10px] font-bold mt-1.5 ${
                                    isCompleted ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"
                                  }`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* ORDERED LINE ITEMS */}
                        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Itemized Goods
                          </h4>
                          <div className="space-y-3">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between text-sm py-2">
                                <div>
                                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{item.product.name}</p>
                                  {item.variant && (
                                    <p className="text-xs text-zinc-500 mt-0.5">Option: {item.variant.name}</p>
                                  )}
                                  <p className="text-xs text-zinc-400 font-mono mt-0.5">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                                </div>
                                <span className="font-bold text-zinc-950 dark:text-white">
                                  ${(Number(item.price) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SHIPPING DETAILS SUB BLOCK */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-900 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          <div>
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase mb-1.5">Shipping Coordinate</h4>
                            <p>
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                              {order.shippingAddress.address1}<br />
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                              Phone: {order.shippingAddress.phone}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase mb-1.5">Transaction Coordinates</h4>
                            <p>
                              Payment Mode: <span className="font-bold">{order.paymentMethod}</span><br />
                              Order ID: <span className="font-mono">{order.id}</span>
                            </p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


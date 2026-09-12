"use client";

import { useCallback, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { CustomerActivityType } from "@repo/shared";

interface TrackOptions {
  type: CustomerActivityType;
  productId?: string | null;
  categoryId?: string | null;
  orderId?: string | null;
  searchQuery?: string | null;
  metadata?: Record<string, any> | null;
  duration?: number | null;
}

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export function useActivityTracker() {
  const getSessionId = useCallback((): string => {
    if (typeof window === "undefined") return "";
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("cart_session_id", sessionId);
    }
    return sessionId;
  }, []);

  const track = useCallback(
    async (options: TrackOptions) => {
      if (typeof window === "undefined") return;

      const sessionId = getSessionId();

      const payload = {
        type: options.type,
        sessionId,
        productId: options.productId || null,
        categoryId: options.categoryId || null,
        orderId: options.orderId || null,
        searchQuery: options.searchQuery || null,
        metadata: options.metadata || null,
        duration: options.duration || null,
      };

      // 1. First-party server tracking
      try {
        await api.post("/activities/track", payload);
      } catch (err) {
        // Silently fail so customer experience is never interrupted
        console.warn("[ActivityTracker] Failed to record event:", err);
      }

      // 2. Client-side third-party analytics sync (GA4 & Meta Pixel)
      try {
        if (options.type === "PRODUCT_VIEW") {
          window.gtag?.("event", "view_item", {
            items: [{ item_id: options.productId, item_name: options.metadata?.name, price: options.metadata?.price }],
          });
          window.fbq?.("track", "ViewContent", {
            content_ids: options.productId ? [options.productId] : [],
            content_name: options.metadata?.name,
            value: options.metadata?.price,
            currency: "USD",
          });
        } else if (options.type === "SEARCH") {
          window.gtag?.("event", "search", { search_term: options.searchQuery });
          window.fbq?.("track", "Search", { search_string: options.searchQuery });
        } else if (options.type === "ADD_TO_CART") {
          window.gtag?.("event", "add_to_cart", {
            items: [{ item_id: options.productId, item_name: options.metadata?.name, quantity: options.metadata?.quantity }],
          });
          window.fbq?.("track", "AddToCart", {
            content_ids: options.productId ? [options.productId] : [],
            value: options.metadata?.price,
            currency: "USD",
          });
        } else if (options.type === "INITIATE_CHECKOUT") {
          window.gtag?.("event", "begin_checkout", { value: options.metadata?.total, currency: "USD" });
          window.fbq?.("track", "InitiateCheckout", { value: options.metadata?.total, currency: "USD" });
        }
      } catch (analyticsErr) {
        console.warn("[ActivityTracker] Third-party tracking error:", analyticsErr);
      }
    },
    [getSessionId]
  );

  return {
    track,
    getSessionId,
  };
}

/**
 * Convenience hook to track automatic page views with duration tracking on unmount/page-leave.
 */
export function usePageViewTracker(pageName: string, metadata?: Record<string, any>) {
  const { track } = useActivityTracker();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    track({
      type: "PAGE_VIEW",
      metadata: {
        page: pageName,
        url: typeof window !== "undefined" ? window.location.pathname : "",
        ...metadata,
      },
    });

    return () => {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSeconds > 1) {
        // Log duration on page exit
        track({
          type: "PAGE_VIEW",
          duration: durationSeconds,
          metadata: {
            page: pageName,
            isExit: true,
            ...metadata,
          },
        });
      }
    };
  }, [pageName, track]);
}

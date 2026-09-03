import { create } from "zustand";
import { api } from "../lib/api";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  images: Array<{ url: string; isPrimary: boolean }>;
}

export interface CartVariant {
  id: string;
  name: string;
  sku: string;
  price: string | number;
  imageUrl?: string | null;
}

export interface CartItem {
  id: string; // CartItem ID from database (or client-generated for temporary guest state)
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  product: CartProduct;
  variant?: CartVariant | null;
}

interface CartState {
  items: CartItem[];
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  addItem: (productId: string, quantity: number, variantId?: string | null, productData?: any, variantData?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  mergeCart: () => Promise<void>;
  clearCart: () => void;
  
  getTotals: () => {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemsCount: number;
  };
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  sessionId: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("cart_session_id", sessionId);
    }
    set({ sessionId });

    try {
      // Fetch cart from backend API (supplying sessionId either as cookie or query)
      const response = await api.get<{ success: boolean; data: { cart: { items: any[] } } }>(
        `/carts?sessionId=${sessionId}`
      );
      if (response.success && response.data?.cart) {
        set({ items: response.data.cart.items, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      console.warn("Could not fetch cart from server, using local fallback", err);
      // fallback to localStorage for offline development
      const localCart = localStorage.getItem("cart_items");
      if (localCart) {
        try {
          set({ items: JSON.parse(localCart) });
        } catch {
          // ignore parsing error
        }
      }
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, variantId = null, productData = null, variantData = null) => {
    const { sessionId, items } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await api.post<{ success: boolean; data: { item: any } }>("/carts/items", {
        productId,
        productVariantId: variantId,
        quantity,
        sessionId,
      });

      if (response.success) {
        // Refresh cart from server to get clean models
        const cartResponse = await api.get<{ success: boolean; data: { cart: { items: any[] } } }>(
          `/carts?sessionId=${sessionId}`
        );
        if (cartResponse.success && cartResponse.data?.cart) {
          set({ items: cartResponse.data.cart.items, isLoading: false });
          localStorage.setItem("cart_items", JSON.stringify(cartResponse.data.cart.items));
        }
      }
    } catch (err: any) {
      console.warn("Adding item failed, saving to local state only", err);
      // local state fallback
      let updatedItems = [...items];
      const existingIndex = items.findIndex(
        (i) => i.productId === productId && i.productVariantId === variantId
      );

      if (existingIndex > -1) {
        updatedItems[existingIndex].quantity += quantity;
      } else if (productData) {
        updatedItems.push({
          id: `temp_${Date.now()}`,
          productId,
          productVariantId: variantId,
          quantity,
          product: productData,
          variant: variantData,
        });
      }

      set({ items: updatedItems, isLoading: false, error: err.message || "Failed to sync cart" });
      localStorage.setItem("cart_items", JSON.stringify(updatedItems));
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const { sessionId, items } = get();
    if (quantity < 1) return;

    set({ isLoading: true, error: null });
    try {
      if (itemId.startsWith("temp_")) {
        // local state only
        const updatedItems = items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        set({ items: updatedItems, isLoading: false });
        localStorage.setItem("cart_items", JSON.stringify(updatedItems));
        return;
      }

      const response = await api.put<{ success: boolean; data: { item: any } }>(`/carts/items/${itemId}`, {
        quantity,
      });

      if (response.success) {
        const updatedItems = items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        set({ items: updatedItems, isLoading: false });
        localStorage.setItem("cart_items", JSON.stringify(updatedItems));
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to update quantity" });
    }
  },

  removeItem: async (itemId) => {
    const { sessionId, items } = get();
    set({ isLoading: true, error: null });

    try {
      if (itemId.startsWith("temp_")) {
        // local state only
        const updatedItems = items.filter((i) => i.id !== itemId);
        set({ items: updatedItems, isLoading: false });
        localStorage.setItem("cart_items", JSON.stringify(updatedItems));
        return;
      }

      const response = await api.delete<{ success: boolean }>(`/carts/items/${itemId}`);
      if (response.success) {
        const updatedItems = items.filter((i) => i.id !== itemId);
        set({ items: updatedItems, isLoading: false });
        localStorage.setItem("cart_items", JSON.stringify(updatedItems));
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to remove item" });
    }
  },

  mergeCart: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isLoading: true });

    try {
      const response = await api.post<{ success: boolean; data: { cart: { items: any[] } } }>("/carts/merge", {
        sessionId,
      });
      if (response.success && response.data?.cart) {
        set({ items: response.data.cart.items, isLoading: false });
        localStorage.setItem("cart_items", JSON.stringify(response.data.cart.items));
      }
    } catch (err) {
      console.warn("Failed to merge cart on login", err);
      set({ isLoading: false });
    }
  },

  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem("cart_items");
  },

  getTotals: () => {
    const { items } = get();
    const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => {
      const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
      return acc + price * item.quantity;
    }, 0);

    const tax = subtotal * 0.08; // 8% sales tax mock
    const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0; // free shipping over $100
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total,
      itemsCount,
    };
  },
}));

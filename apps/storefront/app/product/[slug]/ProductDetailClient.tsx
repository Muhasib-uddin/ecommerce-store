"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/hooks/useCart";
import { useSettings } from "@/hooks/useSettings";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { storeName } = useSettings();
  const { addItem } = useCart();
  const { track } = useActivityTracker();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: { product: any } }>(`/products/${slug}`);
        if (res.success && res.data?.product) {
          const prod = res.data.product;
          setProduct(prod);
          const primaryImg = prod.images?.find((img: any) => img.isPrimary)?.url || prod.images?.[0]?.url || "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=800&q=80";
          setSelectedImage(primaryImg);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }

          // Track product view
          track({
            type: "PRODUCT_VIEW",
            productId: prod.id,
            categoryId: prod.categoryId,
            metadata: {
              slug: prod.slug,
              name: prod.name,
              price: prod.price,
            },
          });
        }
      } catch (err) {
        console.warn("Failed to load product detail from API, using fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug, track]);

  const handleAddToCart = async () => {
    const targetProd = product || currentProduct;
    if (!targetProd) return;
    try {
      await addItem(
        targetProd.id,
        quantity,
        selectedVariant?.id || null,
        targetProd,
        selectedVariant || null
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);

      track({
        type: "ADD_TO_CART",
        productId: targetProd.id,
        metadata: {
          name: targetProd.name,
          quantity,
          variantId: selectedVariant?.id || null,
          price: targetProd.price,
        },
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-3/4" />
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/4" />
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full" />
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Fallback product if not returned by server
  const currentProduct = product || {
    id: "prod-1",
    name: "Classic Cashmere Sweater",
    slug: slug || "classic-cashmere-sweater",
    price: 185.0,
    compareAtPrice: 220.0,
    description: "Crafted from 100% sustainably-sourced Mongolian cashmere. This mid-weight, crewneck sweater offers exceptional softness, durability, and classic styling appropriate for layering in colder climates or wearing on its own.",
    stock: 25,
    averageRating: 4.9,
    reviewCount: 34,
    images: [
      { url: "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80" },
    ],
    category: { name: "Apparel", slug: "apparel" },
  };

  const images = currentProduct.images || [];
  const displayImage = selectedImage || images[0]?.url || "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 overflow-x-auto">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Shop
        </Link>
        {currentProduct.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/shop?category=${currentProduct.category.slug}`}
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {currentProduct.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-900 dark:text-white font-medium truncate">{currentProduct.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left: Images Showcase */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <img
              src={displayImage}
              alt={currentProduct.name}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    displayImage === img.url
                      ? "border-indigo-600 dark:border-indigo-400 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{storeName || "LUMIÈRE"} Signature</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              {currentProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(currentProduct.averageRating || 5)
                        ? "fill-current text-amber-400"
                        : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {currentProduct.averageRating || 5.0}
              </span>
              <span>({currentProduct.reviewCount || 12} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-zinc-950 dark:text-white">
              {formatPrice(selectedVariant?.price || currentProduct.price)}
            </span>
            {currentProduct.compareAtPrice && (
              <span className="text-lg text-zinc-400 line-through">
                {formatPrice(currentProduct.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {currentProduct.description}
          </p>

          {/* Variants if any */}
          {currentProduct.variants && currentProduct.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Select Option / Size
              </label>
              <div className="flex flex-wrap gap-2">
                {currentProduct.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.id === variant.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                    }`}
                  >
                    {variant.name || variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-8 w-8 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-full text-sm transition-all shadow-lg shadow-indigo-500/20"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>

          {/* Benefits Bullet Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Complimentary Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>30-Day Free Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Lifetime Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

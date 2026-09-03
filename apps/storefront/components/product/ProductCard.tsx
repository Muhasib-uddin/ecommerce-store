"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    compareAtPrice?: string | number | null;
    category?: { name: string; slug: string } | null;
    images?: Array<{ url: string; isPrimary: boolean }>;
    averageRating?: number;
    reviewCount?: number;
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const primaryImage = product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation to detail page
    setIsAdding(true);
    try {
      const productCartData = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images || [],
      };
      await addItem(product.id, 1, null, productCartData, null);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Failed to quick add", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300 hover:shadow-lg dark:hover:shadow-indigo-950/20 hover:-translate-y-0.5">
      
      {/* Product Image & Badges */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900 block">
        {primaryImage.startsWith("http") || primaryImage.startsWith("/") ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-zinc-400">
            No Image Available
          </div>
        )}

        {/* Category Badges & Sale Tags */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {product.category && (
            <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-100 dark:border-zinc-800">
              {product.category.name}
            </span>
          )}
          {discountPercent && (
            <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick Add Button Over Image */}
        <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || product.stock === 0}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-colors ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white"
            } ${product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            title={product.stock === 0 ? "Out of Stock" : "Quick Add"}
          >
            {added ? (
              <Check className="h-5 w-5" />
            ) : (
              <ShoppingBag className="h-5 w-5" />
            )}
          </button>
        </div>
      </Link>

      {/* Info Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Rating Row */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(product.averageRating || 4.2)
                    ? "fill-current"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            ({product.reviewCount || 12})
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Prices */}
        <div className="mt-auto flex items-baseline gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
          <span className="text-base font-bold text-zinc-950 dark:text-zinc-50">
            {formatPrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

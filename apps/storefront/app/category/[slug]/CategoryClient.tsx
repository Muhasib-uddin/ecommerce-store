"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { api } from "@/lib/api";

const ALL_MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Classic Cashmere Sweater",
    slug: "classic-cashmere-sweater",
    price: 185.0,
    compareAtPrice: 220.0,
    averageRating: 4.8,
    reviewCount: 34,
    stock: 15,
    category: { name: "Apparel", slug: "apparel" },
    images: [{ url: "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
  },
  {
    id: "prod-2",
    name: "Minimalist Leather Backpack",
    slug: "minimalist-leather-backpack",
    price: 245.0,
    compareAtPrice: null,
    averageRating: 4.9,
    reviewCount: 22,
    stock: 8,
    category: { name: "Accessories", slug: "accessories" },
    images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
  },
  {
    id: "prod-3",
    name: "Aroma Diffuser & Humidifier",
    slug: "aroma-diffuser-humidifier",
    price: 65.0,
    compareAtPrice: 85.0,
    averageRating: 3.7,
    reviewCount: 56,
    stock: 50,
    category: { name: "Living", slug: "living" },
    images: [{ url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
  },
  {
    id: "prod-4",
    name: "Premium Linen Lounge Set",
    slug: "premium-linen-lounge-set",
    price: 135.0,
    compareAtPrice: 165.0,
    averageRating: 4.6,
    reviewCount: 19,
    stock: 4,
    category: { name: "Apparel", slug: "apparel" },
    images: [{ url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
  },
  {
    id: "prod-5",
    name: "Weighted Silk Eye Mask",
    slug: "weighted-silk-eye-mask",
    price: 45.0,
    compareAtPrice: 60.0,
    averageRating: 4.5,
    reviewCount: 8,
    stock: 30,
    category: { name: "Accessories", slug: "accessories" },
    images: [{ url: "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
  },
  {
    id: "prod-6",
    name: "Hand-Blown Glass Vase",
    slug: "hand-blown-glass-vase",
    price: 95.0,
    compareAtPrice: null,
    averageRating: 4.2,
    reviewCount: 14,
    stock: 12,
    category: { name: "Living", slug: "living" },
    images: [{ url: "https://images.unsplash.com/photo-1581781870027-04212e231e96?auto=format&fit=crop&w=600&q=80", isPrimary: true }],
  },
];

export default function CategoryClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    async function loadCategoryProducts() {
      setIsLoading(true);
      if (!slug) return;

      const formattedName = slug.charAt(0).toUpperCase() + slug.slice(1);
      setCategoryName(formattedName);

      try {
        const response = await api.get<{ success: boolean; data: { products: any[] } }>(
          `/products?category=${slug}`
        );
        if (response.success && response.data?.products?.length > 0) {
          setProducts(response.data.products);
        } else {
          const filtered = ALL_MOCK_PRODUCTS.filter((p) => p.category.slug === slug);
          setProducts(filtered);
        }
      } catch (err) {
        console.warn("Category products fetch failed, using fallback data", err);
        const filtered = ALL_MOCK_PRODUCTS.filter((p) => p.category.slug === slug);
        setProducts(filtered);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoryProducts();
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
      <div className="mb-6">
        <button
          onClick={() => router.push("/shop")}
          className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to all collections</span>
        </button>
      </div>

      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Collection: {categoryName}
        </h1>
        <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
          Showing refined styles and accessories selected for {categoryName}.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
              <div className="bg-zinc-200 dark:bg-zinc-800 aspect-square rounded-xl" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-2/3 rounded-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No styles in this category</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            We are currently updating our {categoryName} collection. Please check back shortly or explore other categories.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full"
          >
            Shop Other Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

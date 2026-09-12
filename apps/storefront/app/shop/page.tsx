"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { api } from "@/lib/api";
import { getCurrencyDetails } from "@/lib/currency";
import { usePageViewTracker } from "@/hooks/useActivityTracker";

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
    stock: 0, // Out of stock to test filter
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

const CATEGORIES_LIST = [
  { name: "Apparel", slug: "apparel" },
  { name: "Accessories", slug: "accessories" },
  { name: "Home Living", slug: "living" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters state
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Track shop page view
  usePageViewTracker("Shop", { category: initialCategory });

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // View/Control State
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with url changes
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchVal(searchParams.get("search") || "");
    setCurrentPage(parseInt(searchParams.get("page") || "1", 10));
  }, [searchParams]);

  // Load and apply filters
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      
      // Map frontend sorts to API parameters
      let sortByField = "createdAt";
      let sortOrder = "desc";
      if (sortBy === "price_asc") {
        sortByField = "price";
        sortOrder = "asc";
      } else if (sortBy === "price_desc") {
        sortByField = "price";
        sortOrder = "desc";
      } else if (sortBy === "rating") {
        sortByField = "averageRating";
        sortOrder = "desc";
      }

      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchVal) params.append("search", searchVal);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (inStockOnly) params.append("inStock", "true");
      params.append("sortBy", sortByField);
      params.append("sortOrder", sortOrder);
      params.append("page", currentPage.toString());
      params.append("limit", "6");

      try {
        const response = await api.get<{
          success: boolean;
          data: { products: any[]; pagination: { totalPages: number } };
        }>(`/products?${params.toString()}`);

        if (response.success && response.data?.products?.length > 0) {
          setProducts(response.data.products);
          setTotalPages(response.data.pagination.totalPages || 1);
        } else {
          // Empty DB response, apply client filters to mock dataset
          applyMockFilters();
        }
      } catch (err) {
        console.warn("Products API call failed, sorting mock dataset locally", err);
        applyMockFilters();
      } finally {
        setIsLoading(false);
      }
    }

    // Mock filtering logic for standalone builds
    function applyMockFilters() {
      let filtered = [...ALL_MOCK_PRODUCTS];

      if (selectedCategory) {
        filtered = filtered.filter((p) => p.category.slug === selectedCategory);
      }
      if (searchVal) {
        const term = searchVal.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(term) || p.category.name.toLowerCase().includes(term)
        );
      }
      if (minPrice) {
        filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
      }
      if (inStockOnly) {
        filtered = filtered.filter((p) => p.stock > 0);
      }
      if (ratingFilter) {
        filtered = filtered.filter((p) => p.averageRating >= ratingFilter);
      }

      // Sort Mock
      if (sortBy === "price_asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price_desc") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === "rating") {
        filtered.sort((a, b) => b.averageRating - a.averageRating);
      } else {
        // default newest
        filtered.sort((a, b) => b.id.localeCompare(a.id));
      }

      // Paginate Mock
      const limit = 6;
      const totalMockPages = Math.max(Math.ceil(filtered.length / limit), 1);
      const startIndex = (currentPage - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      setProducts(paginated);
      setTotalPages(totalMockPages);
    }

    fetchProducts();
  }, [selectedCategory, searchVal, minPrice, maxPrice, inStockOnly, ratingFilter, sortBy, currentPage]);

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset pagination on filter change
    router.push(`/shop?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    const newVal = selectedCategory === slug ? "" : slug;
    setSelectedCategory(newVal);
    updateUrlParam("category", newVal);
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setRatingFilter(null);
    setSortBy("newest");
    setCurrentPage(1);
    router.push("/shop");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Premium Catalogue
          </h1>
          {searchVal && (
            <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
              Showing search results for: <span className="font-semibold text-indigo-600">"{searchVal}"</span>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Sorting */}
          <div className="relative flex items-center border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1.5 bg-white dark:bg-zinc-950 text-sm">
            <ArrowUpDown className="h-4 w-4 text-zinc-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateUrlParam("sort", e.target.value);
              }}
              className="bg-transparent text-zinc-800 dark:text-zinc-200 outline-none pr-1 font-medium cursor-pointer"
            >
              <option value="newest">Featured Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Average Reviews</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1.5 bg-white dark:bg-zinc-950 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* FILTERS SIDEBAR - DESKTOP */}
        <aside className="hidden lg:block space-y-8 self-start sticky top-24">
          
          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`flex w-full items-center justify-between text-sm py-1.5 px-3 rounded-lg transition-colors text-left ${
                    selectedCategory === cat.slug
                      ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Price Range ({getCurrencyDetails().symbol.trim()})
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-600"
              />
              <span className="text-zinc-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Stock Availability */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Availability
            </h3>
            <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Average Rating Checkbox */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Customer Rating
            </h3>
            <div className="space-y-2">
              {[4, 3].map((stars) => (
                <label key={stars} className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={ratingFilter === stars}
                    onChange={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>{stars} Stars & Up</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 w-full pt-4 border-t border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        </aside>

        {/* PRODUCTS LISTING */}
        <div className="lg:col-span-3 flex flex-col">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-start">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
                  <div className="bg-zinc-200 dark:bg-zinc-800 aspect-square rounded-xl" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-2/3 rounded-full" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-1/2 rounded-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No products found</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                Try widening your price range, updating keywords, or resetting filter toggles.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full shadow-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-12 gap-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-full border border-zinc-200 dark:border-zinc-800 self-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-full hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent text-zinc-600 dark:text-zinc-400 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 text-xs font-bold rounded-full transition-all ${
                        currentPage === i + 1
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-zinc-600 hover:bg-white dark:hover:bg-zinc-900"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-full hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent text-zinc-600 dark:text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS OVERLAY */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-xs transform transition-transform duration-300 bg-white dark:bg-zinc-950 p-6 flex flex-col shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-105">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  ✕
                </button>
              </div>

              {/* Mobile Sidebar filters list */}
              <div className="flex-1 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES_LIST.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          handleCategorySelect(cat.slug);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selectedCategory === cat.slug
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    Price Range ({getCurrencyDetails().symbol.trim()})
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-transparent text-zinc-900 dark:text-zinc-100 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-transparent text-zinc-900 dark:text-zinc-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Availability</h3>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6 flex gap-2">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-2 text-xs font-bold text-center border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2 text-xs font-bold text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-zinc-500">
        Loading catalog interface...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

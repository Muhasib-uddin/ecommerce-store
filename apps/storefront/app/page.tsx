"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { api } from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";

// Fallback products for initial loading or empty catalog
const MOCK_PRODUCTS = [
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
    averageRating: 4.7,
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
];

const FALLBACK_CATEGORIES = [
  { id: "cat-1", name: "Apparel", slug: "apparel", count: 42, icon: "👗", imageUrl: "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-2", name: "Accessories", slug: "accessories", count: 28, icon: "👜", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-3", name: "Home Living", slug: "living", count: 19, icon: "🕯️", imageUrl: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-4", name: "New Arrivals", slug: "new", count: 12, icon: "✨", imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80" },
];

export default function Home() {
  const {
    storeName,
    heroSliders,
    valueProps,
    promoBanners,
    testimonials,
    homepageSections,
  } = useSettings();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Active hero sliders
  const activeSliders = useMemo(
    () => (heroSliders || []).filter((s) => s.active !== false),
    [heroSliders]
  );

  // Active value props
  const activeValueProps = useMemo(
    () => (valueProps || []).filter((vp) => vp.active !== false),
    [valueProps]
  );

  // Active promo banners
  const activePromoBanners = useMemo(
    () => (promoBanners || []).filter((b) => b.active !== false),
    [promoBanners]
  );

  // Active testimonials
  const activeTestimonials = useMemo(
    () => (testimonials || []).filter((t) => t.active !== false),
    [testimonials]
  );

  // Fetch live products and categories on mount
  useEffect(() => {
    async function loadCatalogData() {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get<{ success: boolean; data: { products: any[] } }>("/products?limit=8"),
          api.get<{ success: boolean; data: { categories: any[] } }>("/categories"),
        ]);

        if (prodRes.status === "fulfilled" && prodRes.value.success && prodRes.value.data?.products?.length > 0) {
          setProducts(prodRes.value.data.products);
        } else {
          setProducts(MOCK_PRODUCTS);
        }

        if (catRes.status === "fulfilled" && catRes.value.success && catRes.value.data?.categories?.length > 0) {
          setCategories(catRes.value.data.categories);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (err) {
        console.warn("Failed to fetch live catalog data, using fallbacks:", err);
        setProducts(MOCK_PRODUCTS);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadCatalogData();
  }, []);

  // Auto-cycle hero slider every 7 seconds if multiple slides
  useEffect(() => {
    if (activeSliders.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % activeSliders.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeSliders.length]);

  const currentHero = activeSliders[activeSlideIndex] || activeSliders[0] || {
    title: "Refined Living. Elevated Comfort.",
    subtitle: "Explore our new curated selection of cashmere garments, artisanal leather accessories, and hand-poured minimalist home accents.",
    bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Explore Collection",
    ctaLink: "/shop",
  };

  // Section Renderers
  const renderHeroSection = () => (
    <section
      key="hero"
      id="hero-section"
      className="relative overflow-hidden bg-zinc-950 text-white min-h-[580px] sm:min-h-[640px] flex items-center transition-all duration-700"
    >
      {/* Background Hero Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 z-0 opacity-40"
        style={{
          backgroundImage: `url(${currentHero.bgImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/60 via-zinc-950/90 to-zinc-950 z-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32 z-10 w-full">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-6 tracking-wide uppercase shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> {storeName || "LUMIÈRE"} Exclusive
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
            {currentHero.title}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 mb-8 max-w-lg leading-relaxed">
            {currentHero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={currentHero.ctaLink || "/shop"}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-indigo-900/40 transition-all duration-200"
            >
              <span>{currentHero.ctaText || "Shop Collection"}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-2 border border-zinc-700 bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-800 text-white font-semibold px-8 py-4 rounded-full transition-colors"
            >
              <span>View Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Indicator Controls */}
      {activeSliders.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <button
            onClick={() => setActiveSlideIndex((prev) => (prev === 0 ? activeSliders.length - 1 : prev - 1))}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5 px-1">
            {activeSliders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlideIndex ? "w-6 bg-indigo-500" : "w-2 bg-white/40"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setActiveSlideIndex((prev) => (prev + 1) % activeSliders.length)}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );

  const renderValuePropsSection = () => {
    if (activeValueProps.length === 0) return null;
    return (
      <section key="valueProps" id="value-props-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(activeValueProps.length, 4)} gap-6 p-6 rounded-2xl bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-900/30 dark:border-zinc-800`}>
          {activeValueProps.map((vp, index) => (
            <div
              key={vp.id || index}
              className={`flex items-start gap-4 p-4 ${
                index > 0 && index < activeValueProps.length - 1
                  ? "border-y md:border-y-0 md:border-x border-zinc-200/60 dark:border-zinc-800"
                  : ""
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <DynamicIcon nameOrUrl={vp.icon} className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">{vp.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 dark:text-zinc-400 leading-relaxed">{vp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCategoriesSection = () => {
    const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
    return (
      <section key="categories" id="categories-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Shop by Luxury Category</h2>
          <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400">Select any collection block below to explore exquisite styles.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayCategories.slice(0, 8).map((category, index) => {
            const bgGradients = [
              "from-amber-500/10 to-orange-500/10",
              "from-blue-500/10 to-indigo-500/10",
              "from-emerald-500/10 to-teal-500/10",
              "from-pink-500/10 to-rose-500/10",
            ];
            const bgGradient = bgGradients[index % bgGradients.length];

            return (
              <Link
                key={category.slug || category.id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center p-6 rounded-2xl border border-zinc-200 hover:border-indigo-500 dark:border-zinc-800 dark:hover:border-indigo-400/50 hover:shadow-md transition-all duration-300 text-center bg-white dark:bg-zinc-900/20 group"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${bgGradient} text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 overflow-hidden`}>
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <DynamicIcon nameOrUrl={category.icon || "layers"} className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
                  {category.name}
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {category._count?.products !== undefined ? `${category._count.products} Products` : "Explore Catalog"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    );
  };

  const renderBestsellersSection = () => (
    <section key="bestsellers" id="featured-products-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Featured Masterpieces</h2>
          <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400">Exquisitely manufactured materials. Designed to accompany you for generations.</p>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group"
        >
          <span>See all products</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
              <div className="bg-zinc-200 dark:bg-zinc-800 aspect-square rounded-xl" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-2/3 rounded-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );

  const renderPromoSection = () => {
    if (activePromoBanners.length === 0) return null;

    const banner1 = activePromoBanners[0];
    const banner2 = activePromoBanners[1];

    return (
      <section key="promo" id="promo-banners-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Large Editorial Banner */}
          {banner1 && (
            <div className={`${banner2 ? "lg:col-span-8" : "lg:col-span-12"} relative overflow-hidden rounded-3xl bg-zinc-900 text-white min-h-[380px] p-8 sm:p-12 flex flex-col justify-end`}>
              {banner1.bgImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 hover:scale-102 transition-transform duration-700 z-0"
                  style={{ backgroundImage: `url(${banner1.bgImage})` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />

              <div className="relative z-20 max-w-md">
                {banner1.badge && (
                  <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">{banner1.badge}</span>
                )}
                <h3 className="text-2xl sm:text-4xl font-extrabold mt-2 mb-4 leading-tight">{banner1.title}</h3>
                <p className="text-sm text-zinc-300 mb-6 leading-relaxed">{banner1.description}</p>
                <Link
                  href={banner1.ctaLink || "/shop"}
                  className="inline-flex items-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-6 py-3 rounded-full text-sm shadow-md transition-colors"
                >
                  <span>{banner1.ctaText || "Shop Collection"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Secondary Highlight Card */}
          {banner2 && (
            <div className="lg:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-950 text-white min-h-[380px] p-8 flex flex-col justify-end border border-indigo-800/40">
              {banner2.bgImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 z-0"
                  style={{ backgroundImage: `url(${banner2.bgImage})` }}
                />
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-700/30 via-zinc-950/70 to-zinc-950 z-0" />

              <div className="relative z-20">
                {banner2.badge && (
                  <span className="text-xs uppercase font-bold tracking-widest text-pink-400">{banner2.badge}</span>
                )}
                <h3 className="text-2xl font-extrabold mt-2 mb-4">{banner2.title}</h3>
                <p className="text-sm text-zinc-300 mb-6 leading-relaxed">{banner2.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {banner2.couponCode && (
                    <span className="bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider text-indigo-200">
                      {banner2.couponCode}
                    </span>
                  )}
                  <Link
                    href={banner2.ctaLink || "/shop"}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-indigo-200"
                  >
                    <span>{banner2.ctaText || "Shop Now"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderTestimonialsSection = () => {
    if (activeTestimonials.length === 0) return null;
    return (
      <section key="testimonials" id="testimonials-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Reviews & Tastemakers</h2>
          <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400">What clients are writing about our premium catalog experience.</p>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(activeTestimonials.length, 3)} gap-6`}>
          {activeTestimonials.map((item, idx) => (
            <div key={item.id || idx} className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center text-amber-500 mb-4">
                  {Array.from({ length: item.stars || 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-600 dark:text-zinc-350 text-sm leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.author}
                    className="h-10 w-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">
                    {item.author?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{item.author}</h4>
                  {item.role && <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Section Mapping
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: renderHeroSection,
    valueProps: renderValuePropsSection,
    categories: renderCategoriesSection,
    bestsellers: renderBestsellersSection,
    promo: renderPromoSection,
    testimonials: renderTestimonialsSection,
  };

  // Order sections according to admin configuration
  const enabledSections = homepageSections && homepageSections.length > 0
    ? homepageSections.filter((s) => s.enabled !== false)
    : [
        { id: "hero", enabled: true },
        { id: "valueProps", enabled: true },
        { id: "categories", enabled: true },
        { id: "bestsellers", enabled: true },
        { id: "promo", enabled: true },
        { id: "testimonials", enabled: true },
      ];

  return (
    <div className="flex flex-col w-full pb-16">
      {enabledSections.map((sec) => {
        const renderer = sectionRenderers[sec.id];
        return renderer ? renderer() : null;
      })}
    </div>
  );
}

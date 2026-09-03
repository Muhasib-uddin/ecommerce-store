import { create } from "zustand";
import { api } from "../lib/api";

export interface HeroSlider {
  id: number | string;
  title: string;
  subtitle: string;
  bgImage: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
}

export interface ValueProp {
  id: number | string;
  title: string;
  description: string;
  icon: string; // Lucide icon name, image URL, or emoji
  active?: boolean;
}

export interface PromoBanner {
  id: number | string;
  badge?: string;
  title: string;
  description: string;
  bgImage?: string;
  ctaText?: string;
  ctaLink?: string;
  couponCode?: string;
  active?: boolean;
}

export interface Testimonial {
  id: number | string;
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  stars?: number;
  active?: boolean;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  layout?: string;
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string;
  twitterHandle?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  bgColor: string;
  textColor: string;
  link: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  fontFamily: string;
}

export interface SettingsState {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  tagline: string;
  lightLogo: string;
  darkLogo: string;
  favicon: string;
  footerDescription: string;
  footerCopyright: string;
  socialLinks: SocialLinks;
  announcement: AnnouncementSettings;
  themeColors: ThemeColors;
  heroSliders: HeroSlider[];
  valueProps: ValueProp[];
  promoBanners: PromoBanner[];
  testimonials: Testimonial[];
  homepageSections: HomepageSectionConfig[];
  seoSettings: SeoSettings;
  customCss: string;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

export const DEFAULT_SLIDERS: HeroSlider[] = [
  {
    id: 1,
    title: "Discover Modern Luxury",
    subtitle: "Elevate your style with our premium curated collection.",
    bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Shop Collection",
    ctaLink: "/shop",
    active: true,
  },
  {
    id: 2,
    title: "New Season Arrivals",
    subtitle: "Lightweight fabrics and artisanal designs tailored for everyday elegance.",
    bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Explore Now",
    ctaLink: "/shop?sort=newest",
    active: true,
  },
];

export const DEFAULT_VALUE_PROPS: ValueProp[] = [
  {
    id: 1,
    title: "Complimentary Shipping",
    description: "Free delivery on qualifying orders. Dispatched in signature packaging.",
    icon: "truck",
    active: true,
  },
  {
    id: 2,
    title: "Hassle-Free Returns",
    description: "30-day dynamic window for premium returns or simple size exchanges.",
    icon: "refresh",
    active: true,
  },
  {
    id: 3,
    title: "Extended Quality Guarantee",
    description: "All luxury goods feature a lifetime promise on craftsmanship and fabrics.",
    icon: "shield",
    active: true,
  },
];

export const DEFAULT_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 1,
    badge: "Artisanal Studio",
    title: "Handcrafted Leather Essentials",
    description: "Tanned using pure plant extracts. Designed to age with a rich, unique patina over years of use.",
    bgImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Shop Accessories",
    ctaLink: "/shop?category=accessories",
    active: true,
  },
  {
    id: 2,
    badge: "Exclusive Offer",
    title: "First Order Discount",
    description: "Unlock 20% off your initial purchase of luxury loungewear. Simply apply the premium promo code during checkout.",
    bgImage: "",
    ctaText: "Shop Apparel",
    ctaLink: "/shop?category=apparel",
    couponCode: "WELCOME20",
    active: true,
  },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "The weight and stitching on the cashmere sweater are outstanding. Truly sits in the highest tier of apparel design.",
    author: "Sophia R.",
    role: "Creative Director",
    stars: 5,
    active: true,
  },
  {
    id: 2,
    quote: "Minimalist leather backpack has been my travel companion for 6 months. It has developed a beautiful custom sheen.",
    author: "Liam M.",
    role: "Product Designer",
    stars: 5,
    active: true,
  },
  {
    id: 3,
    quote: "Clean, minimalist, customer support answered my shipping queries in under five minutes. Outstanding quality product.",
    author: "Elena K.",
    role: "Interior Stylist",
    stars: 5,
    active: true,
  },
];

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: "hero", name: "Hero Sliders", enabled: true, layout: "fullwidth" },
  { id: "valueProps", name: "Value Propositions", enabled: true, layout: "grid-3-cols" },
  { id: "categories", name: "Featured Categories", enabled: true, layout: "grid-4-cols" },
  { id: "bestsellers", name: "Featured Products", enabled: true, layout: "grid-4-cols" },
  { id: "promo", name: "Editorial Promo Banners", enabled: true, layout: "split-screen" },
  { id: "testimonials", name: "Client Reviews & Tastemakers", enabled: true, layout: "cards-3-cols" },
];

function safeJsonParse<T>(raw: any, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) ? parsed : fallback) as T;
    }
    return parsed as T;
  } catch (e) {
    return fallback;
  }
}

export const useSettings = create<SettingsState>((set, get) => ({
  storeName: "LUMIÈRE",
  contactEmail: "support@lumiere.com",
  contactPhone: "+1 (800) 555-0199",
  address: "142 Mercer Street, New York, NY 10012",
  currency: "PKR",
  tagline: "Curated premium lifestyle products designed for modern comfort.",
  lightLogo: "",
  darkLogo: "",
  favicon: "",
  footerDescription: "Curated premium lifestyle products designed for modern comfort. Elevate your everyday aesthetic.",
  footerCopyright: `© ${new Date().getFullYear()} LUMIÈRE Store. All rights reserved.`,
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    tiktok: "https://tiktok.com",
    pinterest: "",
    linkedin: "",
  },
  announcement: {
    enabled: true,
    text: "✨ Free shipping on orders over $100! Use code PREMIUM20 for 20% off.",
    bgColor: "#000000",
    textColor: "#ffffff",
    link: "/shop",
  },
  themeColors: {
    primary: "#4f46e5",
    secondary: "#0ea5e9",
    background: "#ffffff",
    fontFamily: "Inter",
  },
  heroSliders: DEFAULT_SLIDERS,
  valueProps: DEFAULT_VALUE_PROPS,
  promoBanners: DEFAULT_PROMO_BANNERS,
  testimonials: DEFAULT_TESTIMONIALS,
  homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
  seoSettings: {
    metaTitle: "LUMIÈRE | Curated Luxury Lifestyle & Apparel",
    metaDescription: "Experience refined living with our curated collection of cashmere garments, artisanal leather accessories, and hand-poured minimalist home accents.",
    ogImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    keywords: "luxury apparel, cashmere sweaters, leather bags, minimalist decor, premium store",
    twitterHandle: "@lumiere_store",
  },
  customCss: "",
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchSettings: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          storeSettings: Record<string, any>;
          themeSettings: Record<string, any>;
        };
      }>("/settings");

      if (response.success && response.data) {
        const s = response.data.storeSettings || {};
        const t = response.data.themeSettings || {};

        const parsedSliders = safeJsonParse<HeroSlider[]>(
          t.heroSliders || t.hero_sliders,
          DEFAULT_SLIDERS
        );

        const parsedValueProps = safeJsonParse<ValueProp[]>(
          t.valueProps || t.value_props || t.featureCards || t.feature_cards,
          DEFAULT_VALUE_PROPS
        );

        const parsedPromoBanners = safeJsonParse<PromoBanner[]>(
          t.promoBanners || t.promo_banners,
          DEFAULT_PROMO_BANNERS
        );

        const parsedTestimonials = safeJsonParse<Testimonial[]>(
          t.testimonials,
          DEFAULT_TESTIMONIALS
        );

        const parsedHomepageSections = safeJsonParse<HomepageSectionConfig[]>(
          t.homepageSections || t.homepage_sections,
          DEFAULT_HOMEPAGE_SECTIONS
        );

        const parsedSeoSettings: SeoSettings = {
          metaTitle: s.seoMetaTitle || s.seo_meta_title || s.metaTitle || s.storeName || "LUMIÈRE | Curated Luxury Lifestyle",
          metaDescription: s.seoMetaDescription || s.seo_meta_description || s.metaDescription || s.tagline || "Experience refined living with our curated luxury collections.",
          ogImage: s.seoOgImage || s.seo_og_image || s.ogImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
          keywords: s.seoKeywords || s.seo_keywords || "luxury, apparel, accessories, lifestyle",
          twitterHandle: s.twitterHandle || s.twitter_handle || "@lumiere_store",
        };

        const currencyCode = s.currency || s.store_currency || "PKR";
        if (typeof window !== "undefined") {
          localStorage.setItem("store_currency", currencyCode);
        }

        set({
          storeName: s.storeName || s.store_name || s.businessName || "LUMIÈRE",
          contactEmail: s.contactEmail || s.contact_email || s.supportEmail || "support@lumiere.com",
          contactPhone: s.contactPhone || s.contact_phone || "+1 (800) 555-0199",
          address: s.address || s.store_address || "142 Mercer Street, New York, NY 10012",
          currency: currencyCode,
          tagline: s.tagline || "Curated premium lifestyle products designed for modern comfort.",
          lightLogo: s.lightLogo || s.store_logo_light || "",
          darkLogo: s.darkLogo || s.store_logo_dark || "",
          favicon: s.favicon || s.store_favicon || "",
          footerDescription: s.footerDescription || s.footer_description || "Curated premium lifestyle products designed for modern comfort. Elevate your everyday aesthetic.",
          footerCopyright: s.footerCopyright || s.footer_copyright || `© ${new Date().getFullYear()} ${s.storeName || "LUMIÈRE"} Store. All rights reserved.`,
          socialLinks: {
            facebook: s.socialFacebook || s.social_facebook || "",
            instagram: s.socialInstagram || s.social_instagram || "",
            twitter: s.socialTwitter || s.social_twitter || "",
            youtube: s.socialYoutube || s.social_youtube || "",
            tiktok: s.socialTiktok || s.social_tiktok || "",
            pinterest: s.socialPinterest || s.social_pinterest || "",
            linkedin: s.socialLinkedin || s.social_linkedin || "",
          },
          announcement: {
            enabled: t.announcementEnabled === "true" || t.announcement_enabled === "true" || String(t.announcementEnabled) === "true",
            text: t.announcementText || t.announcement_text || "✨ Free shipping on orders over $100! Use code PREMIUM20 for 20% off.",
            bgColor: t.announcementBgColor || t.announcement_bg_color || "#000000",
            textColor: t.announcementTextColor || t.announcement_text_color || "#ffffff",
            link: t.announcementLink || t.announcement_link || "/shop",
          },
          themeColors: {
            primary: t.colorPrimary || t.primary_color || "#4f46e5",
            secondary: t.colorSecondary || t.secondary_color || "#0ea5e9",
            background: t.colorBackground || t.background_color || "#ffffff",
            fontFamily: t.fontFamily || t.font_family || "Inter",
          },
          heroSliders: parsedSliders,
          valueProps: parsedValueProps,
          promoBanners: parsedPromoBanners,
          testimonials: parsedTestimonials,
          homepageSections: parsedHomepageSections,
          seoSettings: parsedSeoSettings,
          customCss: t.customCss || t.custom_css || "",
          isLoading: false,
          isLoaded: true,
        });
      }
    } catch (err: any) {
      console.warn("Failed to load storefront settings from server, using aesthetic defaults:", err);
      set({ isLoading: false, isLoaded: true });
    }
  },
}));

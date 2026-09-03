import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let pageRoutes: MetadataRoute.Sitemap = [];

  try {
    const [productsRes, categoriesRes, pagesRes] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/products?limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/cms/pages`, { next: { revalidate: 3600 } }),
    ]);

    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      const prodData = await productsRes.value.json();
      const prods = prodData.data?.products || [];
      productRoutes = prods.map((prod: any) => ({
        url: `${BASE_URL}/product/${prod.slug}`,
        lastModified: prod.updatedAt || currentDate,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
    }

    if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
      const catData = await categoriesRes.value.json();
      const cats = catData.data?.categories || [];
      categoryRoutes = cats.map((cat: any) => ({
        url: `${BASE_URL}/category/${cat.slug}`,
        lastModified: cat.updatedAt || currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }

    if (pagesRes.status === "fulfilled" && pagesRes.value.ok) {
      const pageData = await pagesRes.value.json();
      const pages = pageData.data?.pages || [];
      pageRoutes = pages
        .filter((p: any) => p.published && !["faq", "privacy", "terms", "contact"].includes(p.slug))
        .map((p: any) => ({
          url: `${BASE_URL}/${p.slug}`,
          lastModified: p.updatedAt || currentDate,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    }
  } catch (err) {
    console.warn("Dynamic sitemap fetch error, falling back to static routes:", err);
  }

  // Fallbacks if API is unavailable during build
  if (productRoutes.length === 0) {
    productRoutes = ["classic-cashmere-sweater", "minimalist-leather-backpack", "aroma-diffuser-humidifier", "premium-linen-lounge-set"].map((slug) => ({
      url: `${BASE_URL}/product/${slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  }

  if (categoryRoutes.length === 0) {
    categoryRoutes = ["apparel", "accessories", "living", "new"].map((slug) => ({
      url: `${BASE_URL}/category/${slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...pageRoutes];
}

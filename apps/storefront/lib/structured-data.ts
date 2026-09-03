/**
 * Structured Data (JSON-LD) generators for Search Engine Optimization.
 * Conforms to Schema.org standards for rich Google Search features.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function generateOrganizationSchema(storeInfo?: {
  name?: string;
  logo?: string;
  url?: string;
  contactPoint?: { telephone?: string; email?: string };
  socials?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeInfo?.name || "LUMIÈRE Premium Store",
    url: storeInfo?.url || BASE_URL,
    logo: storeInfo?.logo || `${BASE_URL}/favicon.ico`,
    contactPoint: storeInfo?.contactPoint
      ? {
          "@type": "ContactPoint",
          telephone: storeInfo.contactPoint.telephone,
          email: storeInfo.contactPoint.email,
          contactType: "customer service",
        }
      : undefined,
    sameAs: storeInfo?.socials?.filter(Boolean) || [
      "https://www.facebook.com",
      "https://twitter.com",
      "https://www.instagram.com",
    ],
  };
}

export function generateWebSiteSchema(siteInfo?: {
  name?: string;
  url?: string;
  searchUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteInfo?.name || "LUMIÈRE",
    url: siteInfo?.url || BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteInfo?.searchUrl || `${BASE_URL}/shop`}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateProductSchema(product: {
  id?: string;
  name: string;
  description?: string | null;
  images?: Array<string | { url: string }> | string[];
  sku?: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  currency?: string;
  stock?: number;
  availability?: string;
  averageRating?: number;
  reviewCount?: number;
  category?: { name: string } | string;
  brand?: string;
}) {
  const imageUrls: string[] = (product.images || []).map((img) =>
    typeof img === "string" ? img : img.url
  );

  const numPrice = Number(product.price) || 0;
  const inStock = product.stock === undefined || product.stock > 0;
  const availabilityUrl =
    product.availability === "in_stock" || inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `Buy ${product.name} at premium luxury quality and complimentary delivery.`,
    image: imageUrls.length > 0 ? imageUrls : [`${BASE_URL}/placeholder.png`],
    sku: product.sku || product.id || "SKU-PRODUCT",
    brand: {
      "@type": "Brand",
      name: product.brand || "LUMIÈRE",
    },
    category:
      typeof product.category === "string"
        ? product.category
        : product.category?.name || "Luxury Lifestyle",
    offers: {
      "@type": "Offer",
      price: numPrice.toFixed(2),
      priceCurrency: product.currency || "PKR",
      availability: availabilityUrl,
      itemCondition: "https://schema.org/NewCondition",
      url: `${BASE_URL}/product/${product.sku || product.id || ""}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      seller: {
        "@type": "Organization",
        name: "LUMIÈRE",
      },
    },
  };

  if (product.reviewCount && product.reviewCount > 0 && product.averageRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.averageRating).toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateCollectionSchema(collection: {
  name: string;
  description?: string;
  url: string;
  numberOfItems?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description || `Browse ${collection.name} products.`,
    url: collection.url.startsWith("http")
      ? collection.url
      : `${BASE_URL}${collection.url}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collection.numberOfItems || 0,
    },
  };
}

export function generateArticleSchema(article: {
  title: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image || `${BASE_URL}/placeholder.png`,
    datePublished: article.datePublished || new Date().toISOString(),
    dateModified: article.dateModified || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: article.authorName || "LUMIÈRE Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "LUMIÈRE",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url.startsWith("http")
        ? article.url
        : `${BASE_URL}${article.url}`,
    },
  };
}

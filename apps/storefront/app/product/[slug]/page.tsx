import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProductData(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.product || null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductData(slug);

  if (!product) {
    return {
      title: "Luxury Product Details | LUMIÈRE Store",
      description: "Explore our curated luxury collections with handcrafted materials and timeless elegance.",
    };
  }

  const primaryImage =
    product.images?.find((img: any) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=800&q=80";

  const description =
    product.description ||
    `Experience exceptional luxury craftsmanship with ${product.name}. Complimentary shipping and premium guarantee included.`;

  return {
    title: `${product.name} | LUMIÈRE Store`,
    description,
    keywords: [
      product.name,
      product.category?.name || "Luxury",
      "apparel",
      "lifestyle",
      "shop online",
    ],
    openGraph: {
      title: `${product.name} | LUMIÈRE Store`,
      description,
      url: `${APP_URL}/product/${product.slug}`,
      siteName: "LUMIÈRE",
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | LUMIÈRE Store`,
      description,
      images: [primaryImage],
    },
    alternates: {
      canonical: `${APP_URL}/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductData(slug);

  const targetProduct = product || {
    id: "prod-fallback",
    name: "Classic Luxury Product",
    slug,
    price: 185.0,
    currency: "PKR",
    availability: "in_stock",
    description: "Crafted from 100% sustainably-sourced materials with timeless styling.",
    images: [
      "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=800&q=80",
    ],
    sku: `SKU-${slug.toUpperCase()}`,
  };

  const productSchema = generateProductSchema(targetProduct);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: targetProduct.category?.name || "Shop", url: "/shop" },
    { name: targetProduct.name, url: `/product/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient />
    </>
  );
}

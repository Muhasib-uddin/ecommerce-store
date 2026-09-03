import { Metadata } from "next";
import CategoryClient from "./CategoryClient";
import { generateBreadcrumbSchema, generateCollectionSchema } from "@/lib/structured-data";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formattedName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Collection";

  const title = `${formattedName} Collection | LUMIÈRE Store`;
  const description = `Explore the luxury ${formattedName} collection at LUMIÈRE. Premium fabrics, timeless tailoring, and artisanal quality goods.`;

  return {
    title,
    description,
    keywords: [formattedName, "luxury collection", "online apparel", "lifestyle", "accessories"],
    openGraph: {
      title,
      description,
      url: `${APP_URL}/category/${slug}`,
      siteName: "LUMIÈRE",
      type: "website",
      images: [
        {
          url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 630,
          alt: `${formattedName} Collection`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${APP_URL}/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const formattedName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Collection";

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Collections", url: "/shop" },
    { name: formattedName, url: `/category/${slug}` },
  ]);

  const collectionSchema = generateCollectionSchema({
    name: `${formattedName} Collection`,
    description: `Discover our exclusive selection of ${formattedName} garments and accessories.`,
    url: `/category/${slug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CategoryClient />
    </>
  );
}

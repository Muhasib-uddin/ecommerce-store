import { Metadata } from "next";
import StaticPageClient from "./StaticPageClient";
import { generateBreadcrumbSchema, generateArticleSchema } from "@/lib/structured-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCmsPage(slug: string) {
  if (["faq", "privacy", "terms", "contact"].includes(slug)) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/cms/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.page || null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // 1. Built-in template metadata
  const builtInMeta: Record<string, { title: string; description: string }> = {
    faq: {
      title: "Frequently Asked Questions | LUMIÈRE Store",
      description: "Find instant answers to questions regarding order tracking, complimentary shipping, packaging, and return policies.",
    },
    privacy: {
      title: "Privacy Policy | LUMIÈRE Store",
      description: "Our commitment to data privacy, secure payment gateways, and transparent handling of client personal information.",
    },
    terms: {
      title: "Terms of Service | LUMIÈRE Store",
      description: "Review our online storefront policies, ordering agreements, and intellectual property terms of service.",
    },
    contact: {
      title: "Contact Client Care | LUMIÈRE Store",
      description: "Get in touch with our concierge team for custom sizing, order inquiries, or showroom consultations.",
    },
  };

  if (builtInMeta[slug]) {
    const meta = builtInMeta[slug];
    return {
      title: meta.title,
      description: meta.description,
      openGraph: {
        title: meta.title,
        description: meta.description,
        url: `${APP_URL}/${slug}`,
        siteName: "LUMIÈRE",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
      },
      alternates: {
        canonical: `${APP_URL}/${slug}`,
      },
    };
  }

  // 2. Custom CMS page from Admin
  const page = await getCmsPage(slug);
  if (page) {
    const title = page.metaTitle || `${page.title} | LUMIÈRE Store`;
    const description = page.metaDescription || `Read ${page.title} on LUMIÈRE Store.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${APP_URL}/${slug}`,
        siteName: "LUMIÈRE",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: `${APP_URL}/${slug}`,
      },
    };
  }

  // Fallback
  const formattedTitle = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Page";
  return {
    title: `${formattedTitle} | LUMIÈRE Store`,
    description: `Explore ${formattedTitle} on LUMIÈRE Store.`,
  };
}

export default async function DynamicCmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getCmsPage(slug);

  const pageTitle = page?.title || (slug.charAt(0).toUpperCase() + slug.slice(1));
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: pageTitle, url: `/${slug}` },
  ]);

  const articleSchema = page
    ? generateArticleSchema({
        title: page.title,
        description: page.metaDescription || undefined,
        url: `/${slug}`,
      })
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      <StaticPageClient />
    </>
  );
}

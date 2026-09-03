import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MarketingPopup } from "@/components/layout/MarketingPopup";
import { ThemeStyleInjector } from "@/components/layout/ThemeStyleInjector";
import { TrackingScripts } from "@/components/tracking/TrackingScripts";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: "%s | LUMIÈRE Store",
    default: "LUMIÈRE | Curated Luxury Lifestyle & Apparel",
  },
  description:
    "Experience refined luxury with LUMIÈRE. Curated cashmere garments, artisanal leather goods, and hand-crafted minimalist lifestyle essentials.",
  keywords: [
    "luxury e-commerce",
    "cashmere apparel",
    "leather accessories",
    "minimalist home",
    "high fashion",
    "handcrafted essentials",
  ],
  authors: [{ name: "LUMIÈRE Studio" }],
  creator: "LUMIÈRE",
  publisher: "LUMIÈRE Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "LUMIÈRE | Curated Luxury Lifestyle & Apparel",
    description:
      "Experience refined luxury with LUMIÈRE. Curated cashmere garments, artisanal leather goods, and hand-crafted minimalist lifestyle essentials.",
    url: APP_URL,
    siteName: "LUMIÈRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "LUMIÈRE Premium Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMIÈRE | Curated Luxury Lifestyle & Apparel",
    description:
      "Experience refined luxury with LUMIÈRE. Curated cashmere garments, artisanal leather goods, and hand-crafted minimalist lifestyle essentials.",
    site: "@lumiere_store",
    creator: "@lumiere_store",
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || ((!stored || stored === 'system') && supportDarkMode);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 selection:bg-indigo-500 selection:text-white">
        <ThemeStyleInjector />
        <AnnouncementBar />
        <Suspense fallback={<div className="h-16 bg-white border-b dark:bg-zinc-950 dark:border-zinc-800" />}>
          <Header />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <MarketingPopup />
        <TrackingScripts />
      </body>
    </html>
  );
}

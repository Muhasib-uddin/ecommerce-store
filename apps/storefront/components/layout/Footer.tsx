"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Facebook, Instagram, Twitter, Youtube, Share2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/hooks/useTheme";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const { storeName, lightLogo, darkLogo, footerDescription, footerCopyright, socialLinks } = useSettings();
  const { items: footerNavItems } = useNavigation("footer");
  const { isDark } = useTheme();
  
  const activeLogo = isDark ? (darkLogo || lightLogo) : (lightLogo || darkLogo);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 6000);
    }
  };

  // Group footer nav items or fallback if needed
  const hasSocials = Boolean(
    socialLinks.facebook ||
    socialLinks.instagram ||
    socialLinks.twitter ||
    socialLinks.youtube ||
    socialLinks.tiktok ||
    socialLinks.pinterest
  );

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        
        {/* Footgrid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {activeLogo ? (
                <img
                  src={activeLogo}
                  alt={storeName || "Store Logo"}
                  className="h-7 max-w-[140px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : null}
              <h2 className="text-lg font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
                {storeName || "LUMIÈRE"}
              </h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
              {footerDescription || "Curated premium lifestyle products designed for modern comfort. Elevate your everyday aesthetic."}
            </p>
            
            {/* Social Media Links from Admin */}
            {hasSocials && (
              <div className="flex flex-wrap gap-3 pt-2">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                    aria-label="Twitter / X"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                    aria-label="TikTok"
                  >
                    <Share2 className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Collections & Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Explore Collections
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/shop" className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=apparel" className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Apparel & Fashion
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Signature Accessories
                </Link>
              </li>
              <li>
                <Link href="/shop?category=living" className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Home & Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Dynamic Navigation / Customer Care */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Customer Support & Info
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerNavItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url || "#"}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              VIP Newsletter
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Subscribe to receive updates on new arrivals, private sales, and brand announcements.
            </p>
            {subscribed ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                ✓ Thank you for subscribing! Check your inbox for your welcome offer.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3.5 pl-9 rounded-full text-sm border border-zinc-300 bg-white focus:outline-none focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-indigo-400 text-zinc-900 dark:text-zinc-100 transition-colors"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright & quick links */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 gap-4">
          <p className="text-center sm:text-left">{footerCopyright || `© ${new Date().getFullYear()} ${storeName || "LUMIÈRE"} Store. All rights reserved.`}</p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/faq" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

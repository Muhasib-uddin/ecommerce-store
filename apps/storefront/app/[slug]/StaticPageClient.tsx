"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { api } from "@/lib/api";

export interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  published: boolean;
}

export default function StaticPageClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { storeName, contactEmail, contactPhone, address } = useSettings();

  // Dynamic CMS Page State
  const [cmsPage, setCmsPage] = useState<PageData | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmailInput, setContactEmailInput] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  // FAQ Accordions State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Fetch custom CMS page if slug is not a built-in template
  useEffect(() => {
    async function loadCmsPage() {
      if (!slug || ["faq", "privacy", "terms", "contact"].includes(slug)) {
        setIsPageLoading(false);
        return;
      }

      try {
        setIsPageLoading(true);
        const response = await api.get<{ success: boolean; data: { page: PageData } }>(`/cms/pages/${slug}`);
        if (response.success && response.data?.page) {
          setCmsPage(response.data.page);
        } else {
          setCmsPage(null);
        }
      } catch (err) {
        setCmsPage(null);
      } finally {
        setIsPageLoading(false);
      }
    }

    loadCmsPage();
  }, [slug]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactName("");
    setContactEmailInput("");
    setContactMsg("");
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const faqs = [
    {
      q: "How long does shipping take?",
      a: `Orders placed under our complimentary shipping option are dispatched within 24-48 business hours and arrive in 3-5 business days. International deliveries require 7-14 business days depending on customs processing in the destination country.`,
    },
    {
      q: "What is your refund policy?",
      a: `We offer a 30-day window for hassle-free returns on all unworn, unaltered products in their original luxury packaging. Simply start a return request within your account portal or email our client care team at ${contactEmail || "support@store.com"}.`,
    },
    {
      q: "How do I track my order status?",
      a: `Once your order has been dispatched from our warehouse, you will receive an automatic tracking email containing your courier reference and live delivery timeline. You can also view orders directly in your account dashboard.`,
    },
    {
      q: "Can I exchange sizing for my order?",
      a: "Yes! Exchanges are completely free. Once you initiate an exchange request, we will issue a prepaid return label and dispatch the replacement size immediately, without waiting for the original return to arrive.",
    },
  ];

  // 1. RENDER FAQ CONTENT
  if (slug === "faq") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 w-full flex-1">
        <div className="text-center space-y-3 mb-12">
          <HelpCircle className="h-10 w-10 text-indigo-500 mx-auto" />
          <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Find answers to commonly asked questions about our shipping policies, orders, materials, and sizes.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div
                key={i}
                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-indigo-500" /> : <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />}
                </button>
                {isOpen && (
                  <div className="p-5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. RENDER PRIVACY CONTENT
  if (slug === "privacy") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 w-full flex-1 space-y-6 text-sm text-zinc-600 dark:text-zinc-350 leading-relaxed">
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1. Information We Collect</h2>
          <p>
            {storeName || "Our store"} collects information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact customer support. This includes credentials, contact address, billing coordinates, and details of transactions you execute.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">2. How We Use Information</h2>
          <p>
            We utilize collected details to process checkout orders, send shipping confirmations, improve user experiences across our catalogue, and prevent fraudulent transactions. If you choose to subscribe to our newsletter, we periodically send promotional offers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">3. Contacting Us</h2>
          <p>
            For privacy inquiries or data requests, reach out directly to our privacy officer at {contactEmail || "privacy@store.com"}.
          </p>
        </section>
      </div>
    );
  }

  // 3. RENDER TERMS CONTENT
  if (slug === "terms") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 w-full flex-1 space-y-6 text-sm text-zinc-600 dark:text-zinc-350 leading-relaxed">
        <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1. Service Scope</h2>
          <p>
            {storeName || "Our store"} provides users access to order and buy curated lifestyle garments, home living scents, and leather accessories. All site materials (images, copy, logos) are the intellectual property of {storeName || "the store"}.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">2. User Conduct</h2>
          <p>
            You agree to provide true, accurate account credentials. Any malicious attempt to intercept transactions, manipulate pricing fields, or bypass API access rules is a direct violation of these terms.
          </p>
        </section>
      </div>
    );
  }

  // 4. RENDER CONTACT US CONTENT
  if (slug === "contact") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 w-full flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Coordinates from Admin */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Get in Touch with {storeName || "Us"}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Have a question regarding materials, shipping delays, or customized requests? Fill out our inquiry form or contact our concierge team directly.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4 text-sm text-zinc-650 dark:text-zinc-350">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">Client Care Email</p>
                <a href={`mailto:${contactEmail || "support@store.com"}`} className="text-xs mt-0.5 text-indigo-600 dark:text-indigo-400 hover:underline">
                  {contactEmail || "support@store.com"}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-zinc-650 dark:text-zinc-350">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">Client Care Phone</p>
                <p className="text-xs mt-0.5">{contactPhone || "+1 (800) 555-0199"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-zinc-650 dark:text-zinc-350">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">Flagship Showroom / Office</p>
                <p className="text-xs mt-0.5">{address || "142 Mercer Street, New York, NY 10012"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Inquiry form */}
        <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Send an Inquiry</h2>

          {contactSuccess ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-900">
              ✓ Message Sent! Our concierge team will reply within 12 business hours.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={contactEmailInput}
                  onChange={(e) => setContactEmailInput(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Inquiry Message
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide detailed information regarding your inquiry..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>Send Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 5. RENDER DYNAMIC CMS PAGE (From Admin Page Manager)
  if (cmsPage) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 w-full flex-1 space-y-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
            <FileText className="h-3.5 w-3.5" />
            <span>{storeName || "Store"} Page</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            {cmsPage.title}
          </h1>
        </div>

        <div
          className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: cmsPage.content }}
        />
      </div>
    );
  }

  // 6. LOADING STATE
  if (isPageLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center space-y-4 flex-1 flex flex-col justify-center animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/2 mx-auto" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mx-auto" />
        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full mx-auto" />
      </div>
    );
  }

  // 7. 404 FALLBACK SCREEN
  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center space-y-4 flex-1 flex flex-col justify-center">
      <h1 className="text-5xl font-extrabold text-zinc-900 dark:text-white">404</h1>
      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Page Not Found</h2>
      <p className="text-sm text-zinc-500">
        We could not find the content page associated with the slug <span className="font-semibold text-indigo-600">"{slug}"</span>.
      </p>
      <button
        onClick={() => router.push("/")}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full mt-4 self-center transition-colors"
      >
        Return to Homepage
      </button>
    </div>
  );
}

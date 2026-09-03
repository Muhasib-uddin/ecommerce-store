import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

// Helper to stringify value safely
const serializeValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

// Helper to expand aliases for store settings
const expandStoreAliases = (settings: Record<string, string>): Record<string, string> => {
  const s = { ...settings };

  // Store Name
  const storeName = s.storeName || s.store_name || s.businessName || s.business_name || 'Lumière';
  s.storeName = storeName;
  s.store_name = storeName;
  s.businessName = storeName;
  s.business_name = storeName;

  // Email
  const email = s.contactEmail || s.contact_email || s.supportEmail || s.support_email || s.store_email || 'support@lumiere.com';
  s.contactEmail = email;
  s.contact_email = email;
  s.supportEmail = email;
  s.support_email = email;
  s.store_email = email;

  // Phone
  const phone = s.contactPhone || s.contact_phone || s.supportPhone || s.support_phone || '+1 (800) 555-0199';
  s.contactPhone = phone;
  s.contact_phone = phone;

  // Address
  const address = s.address || s.store_address || '142 Mercer Street, New York, NY 10012';
  s.address = address;
  s.store_address = address;

  // Currency
  const currency = s.currency || s.store_currency || 'PKR';
  s.currency = currency;
  s.store_currency = currency;

  // Logos & Favicon
  if (s.lightLogo || s.store_logo_light || s.logo_url) {
    const light = s.lightLogo || s.store_logo_light || s.logo_url || '';
    s.lightLogo = light;
    s.store_logo_light = light;
  }
  if (s.darkLogo || s.store_logo_dark) {
    const dark = s.darkLogo || s.store_logo_dark || '';
    s.darkLogo = dark;
    s.store_logo_dark = dark;
  }
  if (s.favicon || s.store_favicon) {
    const fav = s.favicon || s.store_favicon || '';
    s.favicon = fav;
    s.store_favicon = fav;
  }

  // SEO Defaults
  const metaTitle = s.seoMetaTitle || s.seo_meta_title || s.metaTitle || 'LUMIÈRE | Curated Luxury Lifestyle & Apparel';
  s.seoMetaTitle = metaTitle;
  s.seo_meta_title = metaTitle;

  const metaDescription = s.seoMetaDescription || s.seo_meta_description || s.metaDescription || 'Experience refined living with our curated collection of cashmere garments, artisanal leather accessories, and hand-poured minimalist home accents.';
  s.seoMetaDescription = metaDescription;
  s.seo_meta_description = metaDescription;

  const ogImage = s.seoOgImage || s.seo_og_image || s.ogImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';
  s.seoOgImage = ogImage;
  s.seo_og_image = ogImage;

  const keywords = s.seoKeywords || s.seo_keywords || 'luxury apparel, cashmere sweaters, leather bags, minimalist decor, premium store';
  s.seoKeywords = keywords;
  s.seo_keywords = keywords;

  const twitterHandle = s.twitterHandle || s.twitter_handle || '@lumiere_store';
  s.twitterHandle = twitterHandle;
  s.twitter_handle = twitterHandle;

  // Social Links
  const socials = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'pinterest', 'linkedin'];
  socials.forEach((platform) => {
    const camel = `social${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
    const snake = `social_${platform}`;
    const val = s[camel] || s[snake] || '';
    s[camel] = val;
    s[snake] = val;
  });

  return s;
};

// Helper to expand aliases for theme settings
const expandThemeAliases = (settings: Record<string, string>): Record<string, string> => {
  const t = { ...settings };

  // Colors
  const primary = t.colorPrimary || t.primary_color || '#4f46e5';
  t.colorPrimary = primary;
  t.primary_color = primary;

  const secondary = t.colorSecondary || t.secondary_color || '#0ea5e9';
  t.colorSecondary = secondary;
  t.secondary_color = secondary;

  const background = t.colorBackground || t.background_color || '#ffffff';
  t.colorBackground = background;
  t.background_color = background;

  const font = t.fontFamily || t.font_family || 'Inter';
  t.fontFamily = font;
  t.font_family = font;

  // Announcement
  const annEnabled = t.announcementEnabled !== undefined ? String(t.announcementEnabled) : (t.announcement_enabled !== undefined ? String(t.announcement_enabled) : 'true');
  t.announcementEnabled = annEnabled;
  t.announcement_enabled = annEnabled;

  const annText = t.announcementText || t.announcement_text || '✨ Free shipping on orders over $100! Use code PREMIUM20 for 20% off.';
  t.announcementText = annText;
  t.announcement_text = annText;

  const annBg = t.announcementBgColor || t.announcement_bg_color || '#000000';
  t.announcementBgColor = annBg;
  t.announcement_bg_color = annBg;

  const annTextCol = t.announcementTextColor || t.announcement_text_color || '#ffffff';
  t.announcementTextColor = annTextCol;
  t.announcement_text_color = annTextCol;

  const annLink = t.announcementLink || t.announcement_link || '/shop';
  t.announcementLink = annLink;
  t.announcement_link = annLink;

  // Sliders & Sections aliases
  if (t.heroSliders || t.hero_sliders) {
    const val = t.heroSliders || t.hero_sliders || '';
    t.heroSliders = val;
    t.hero_sliders = val;
  }

  if (t.valueProps || t.value_props || t.featureCards || t.feature_cards) {
    const val = t.valueProps || t.value_props || t.featureCards || t.feature_cards || '';
    t.valueProps = val;
    t.value_props = val;
  }

  if (t.promoBanners || t.promo_banners) {
    const val = t.promoBanners || t.promo_banners || '';
    t.promoBanners = val;
    t.promo_banners = val;
  }

  if (t.homepageSections || t.homepage_sections) {
    const val = t.homepageSections || t.homepage_sections || '';
    t.homepageSections = val;
    t.homepage_sections = val;
  }

  return t;
};

/**
 * GET /api/v1/settings
 * Fetch all storefront theme/branding/settings (public).
 */
export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [storeSettingsRaw, themeSettingsRaw] = await Promise.all([
      prisma.storeSettings.findMany(),
      prisma.themeSettings.findMany(),
    ]);

    const storeSettings: Record<string, string> = {};
    storeSettingsRaw.forEach((s) => {
      storeSettings[s.key] = s.value;
    });

    const themeSettings: Record<string, string> = {};
    themeSettingsRaw.forEach((t) => {
      themeSettings[t.key] = t.value;
    });

    const expandedStore = expandStoreAliases(storeSettings);
    const expandedTheme = expandThemeAliases(themeSettings);

    res.json({
      success: true,
      data: {
        storeSettings: expandedStore,
        themeSettings: expandedTheme,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/settings
 * Bulk update settings. Admin only.
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeSettings, themeSettings } = req.body;

    await prisma.$transaction(async (tx) => {
      if (storeSettings && typeof storeSettings === 'object') {
        for (const [key, value] of Object.entries(storeSettings)) {
          const serialized = serializeValue(value);
          await tx.storeSettings.upsert({
            where: { key },
            create: { key, value: serialized },
            update: { value: serialized },
          });
        }
      }

      if (themeSettings && typeof themeSettings === 'object') {
        for (const [key, value] of Object.entries(themeSettings)) {
          const serialized = serializeValue(value);
          await tx.themeSettings.upsert({
            where: { key },
            create: { key, value: serialized },
            update: { value: serialized },
          });
        }
      }
    });

    // Query updated values
    const [storeSettingsRaw, themeSettingsRaw] = await Promise.all([
      prisma.storeSettings.findMany(),
      prisma.themeSettings.findMany(),
    ]);

    const storeSettingsObj: Record<string, string> = {};
    storeSettingsRaw.forEach((s) => {
      storeSettingsObj[s.key] = s.value;
    });

    const themeSettingsObj: Record<string, string> = {};
    themeSettingsRaw.forEach((t) => {
      themeSettingsObj[t.key] = t.value;
    });

    res.json({
      success: true,
      message: 'Storefront settings updated successfully.',
      data: {
        storeSettings: expandStoreAliases(storeSettingsObj),
        themeSettings: expandThemeAliases(themeSettingsObj),
      },
    });
  } catch (error) {
    next(error);
  }
};

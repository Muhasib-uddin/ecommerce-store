import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { getRealSettings } from "../helpers/real_backend_helper";

const BrandingContext = createContext({
  storeName: "LUMIÈRE",
  lightLogo: "",
  darkLogo: "",
  favicon: "",
  isLoading: false,
  refreshBranding: async () => {},
  formatTitle: (pageTitle) => pageTitle,
});

export const BrandingProvider = ({ children }) => {
  // Initialize from localStorage if present to prevent layout flicker
  const [branding, setBranding] = useState(() => {
    try {
      const cached = localStorage.getItem("admin_branding");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }
    return {
      storeName: "LUMIÈRE",
      lightLogo: "",
      darkLogo: "",
      favicon: "",
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  const applyFavicon = (favUrl) => {
    if (!favUrl || typeof document === "undefined") return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favUrl;
  };

  const fetchBranding = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getRealSettings();
      if (data && data.storeSettings) {
        const s = data.storeSettings;
        const brandData = {
          storeName: s.storeName || s.store_name || s.businessName || s.business_name || "LUMIÈRE",
          lightLogo: s.lightLogo || s.store_logo_light || s.logo_url || "",
          darkLogo: s.darkLogo || s.store_logo_dark || "",
          favicon: s.favicon || s.store_favicon || "",
        };

        setBranding(brandData);
        try {
          localStorage.setItem("admin_branding", JSON.stringify(brandData));
        } catch (e) {
          // ignore
        }

        if (brandData.favicon) {
          applyFavicon(brandData.favicon);
        }
      }
    } catch (err) {
      console.warn("Could not fetch admin branding from server:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  // Sync favicon if already cached
  useEffect(() => {
    if (branding.favicon) {
      applyFavicon(branding.favicon);
    }
  }, [branding.favicon]);

  const formatTitle = useCallback(
    (pageTitle) => {
      const name = branding.storeName || "Admin";
      if (!pageTitle) return `${name} Admin`;
      return `${pageTitle} | ${name} Admin`;
    },
    [branding.storeName]
  );

  return (
    <BrandingContext.Provider
      value={{
        storeName: branding.storeName || "LUMIÈRE",
        lightLogo: branding.lightLogo,
        darkLogo: branding.darkLogo,
        favicon: branding.favicon,
        isLoading,
        refreshBranding: fetchBranding,
        formatTitle,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

BrandingProvider.propTypes = {
  children: PropTypes.node,
};

export const useBranding = () => useContext(BrandingContext);

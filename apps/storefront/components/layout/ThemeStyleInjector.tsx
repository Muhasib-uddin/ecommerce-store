"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export function ThemeStyleInjector() {
  const { themeColors, customCss, favicon } = useSettings();

  useEffect(() => {
    // Dynamically update favicon if configured
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = favicon;
    }

    // Dynamically inject CSS variables
    if (themeColors.primary) {
      document.documentElement.style.setProperty("--theme-primary", themeColors.primary);
    }
    if (themeColors.secondary) {
      document.documentElement.style.setProperty("--theme-secondary", themeColors.secondary);
    }
  }, [themeColors, customCss, favicon]);

  return (
    <>
      {customCss && (
        <style
          id="storefront-custom-css"
          dangerouslySetInnerHTML={{ __html: customCss }}
        />
      )}
    </>
  );
}

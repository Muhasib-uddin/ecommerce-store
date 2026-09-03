"use client";

import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  isDark: boolean;
  isMounted: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initialize: () => void;
}

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return "system";
}

function applyThemeToDOM(theme: ThemeMode): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  const resolved = theme === "system" ? getSystemPreference() : theme;
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }

  return resolved;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "system",
  resolvedTheme: "light",
  isDark: false,
  isMounted: false,

  setTheme: (newTheme: ThemeMode) => {
    try {
      localStorage.setItem("theme", newTheme);
    } catch (e) {
      // Ignore localStorage errors
    }

    const resolved = applyThemeToDOM(newTheme);
    set({
      theme: newTheme,
      resolvedTheme: resolved,
      isDark: resolved === "dark",
    });
  },

  toggleTheme: () => {
    const { resolvedTheme } = get();
    const nextTheme: ThemeMode = resolvedTheme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },

  initialize: () => {
    if (typeof window === "undefined") return;

    const storedTheme = getStoredTheme();
    const resolved = applyThemeToDOM(storedTheme);

    set({
      theme: storedTheme,
      resolvedTheme: resolved,
      isDark: resolved === "dark",
      isMounted: true,
    });

    // Listen to OS system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const currentTheme = get().theme;
      if (currentTheme === "system") {
        const newResolved = applyThemeToDOM("system");
        set({
          resolvedTheme: newResolved,
          isDark: newResolved === "dark",
        });
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    // Listen to multi-tab storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        const updatedTheme = (e.newValue as ThemeMode) || "system";
        const newResolved = applyThemeToDOM(updatedTheme);
        set({
          theme: updatedTheme,
          resolvedTheme: newResolved,
          isDark: newResolved === "dark",
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
  },
}));

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function AnnouncementBar() {
  const { announcement } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("announcement_dismissed");
    if (!isDismissed && announcement.enabled) {
      setIsVisible(true);
    }
  }, [announcement.enabled]);

  const handleDismiss = () => {
    sessionStorage.setItem("announcement_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible || !announcement.enabled || !announcement.text) return null;

  return (
    <div
      className="relative px-4 py-2.5 text-center text-sm font-medium transition-all duration-300 z-50 shadow-sm"
      style={{
        backgroundColor: announcement.bgColor || "#000000",
        color: announcement.textColor || "#ffffff",
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-center">
        {announcement.link ? (
          <Link
            href={announcement.link}
            className="hover:underline pr-8 text-xs sm:text-sm font-medium tracking-wide flex items-center gap-1.5"
            style={{ color: announcement.textColor || "#ffffff" }}
          >
            <span>{announcement.text}</span>
          </Link>
        ) : (
          <p className="pr-8 text-xs sm:text-sm font-medium tracking-wide">
            {announcement.text}
          </p>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-80 hover:opacity-100 focus:outline-none transition-opacity"
        aria-label="Dismiss announcement"
        style={{ color: announcement.textColor || "#ffffff" }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

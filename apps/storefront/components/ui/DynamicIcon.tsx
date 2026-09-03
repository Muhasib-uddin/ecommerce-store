"use client";

import React from "react";
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Package,
  Star,
  Heart,
  Award,
  Zap,
  Gift,
  Clock,
  CreditCard,
  Lock,
  Send,
  Check,
  CheckCircle,
  RotateCcw,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Percent,
  ArrowRight,
  ChevronRight,
  User,
  Eye,
  Layers,
  Flame,
  Box,
  Compass,
  Globe,
  Feather,
  Sun,
  Moon,
  Smile,
  type LucideIcon,
} from "lucide-react";

// Mapping of common icon name identifiers to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  shipping: Truck,
  delivery: Truck,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  guarantee: ShieldCheck,
  warranty: ShieldCheck,
  refresh: RefreshCw,
  refreshcw: RefreshCw,
  returns: RefreshCw,
  exchange: RotateCcw,
  rotateccw: RotateCcw,
  sparkles: Sparkles,
  luxury: Sparkles,
  package: Package,
  box: Box,
  star: Star,
  rating: Star,
  heart: Heart,
  wishlist: Heart,
  award: Award,
  quality: Award,
  zap: Zap,
  fast: Zap,
  gift: Gift,
  bonus: Gift,
  clock: Clock,
  time: Clock,
  creditcard: CreditCard,
  payment: CreditCard,
  lock: Lock,
  security: Lock,
  send: Send,
  check: Check,
  checkcircle: CheckCircle,
  help: HelpCircle,
  helpcircle: HelpCircle,
  faq: HelpCircle,
  mail: Mail,
  email: Mail,
  phone: Phone,
  contact: Phone,
  map: MapPin,
  mappin: MapPin,
  address: MapPin,
  shoppingbag: ShoppingBag,
  bag: ShoppingBag,
  shoppingcart: ShoppingCart,
  cart: ShoppingCart,
  tag: Tag,
  discount: Percent,
  percent: Percent,
  promo: Percent,
  user: User,
  account: User,
  eye: Eye,
  layers: Layers,
  flame: Flame,
  trending: Flame,
  compass: Compass,
  globe: Globe,
  feather: Feather,
  sun: Sun,
  moon: Moon,
  smile: Smile,
};

export interface DynamicIconProps {
  nameOrUrl?: string;
  className?: string;
  size?: number;
  fallback?: React.ReactNode;
}

export function DynamicIcon({
  nameOrUrl,
  className = "h-5 w-5",
  size,
  fallback = <Sparkles className={className} size={size} />,
}: DynamicIconProps) {
  if (!nameOrUrl || typeof nameOrUrl !== "string") {
    return <>{fallback}</>;
  }

  const trimmed = nameOrUrl.trim();

  // 1. If it is an image / SVG URL
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  ) {
    return (
      <img
        src={trimmed}
        alt="icon"
        className={`object-contain ${className}`}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  // 2. Normalize key for Lucide icon lookup
  const cleanKey = trimmed.toLowerCase().replace(/[\s\-_]/g, "");
  const IconComponent = ICON_MAP[cleanKey];

  if (IconComponent) {
    return <IconComponent className={className} size={size} />;
  }

  // 3. If it looks like an emoji or raw text glyph (e.g. 🚚, ✨, 👗, 👜, 🕯️)
  if (/\p{Extended_Pictographic}/u.test(trimmed) || trimmed.length <= 4) {
    return (
      <span
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={size ? { fontSize: size * 0.8 } : undefined}
      >
        {trimmed}
      </span>
    );
  }

  // Default fallback
  return <>{fallback}</>;
}

export default DynamicIcon;

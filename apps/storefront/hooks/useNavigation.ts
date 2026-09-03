import { useState, useEffect } from "react";
import { api } from "../lib/api";

export interface MenuItemData {
  id: string;
  title: string;
  url: string;
  position: number;
  parentId?: string | null;
  children?: MenuItemData[];
}

export interface NavigationMenuData {
  id: string;
  name: string;
  items: MenuItemData[];
}

// Fallback menus in case the API is offline
const DEFAULT_HEADER_ITEMS: MenuItemData[] = [
  { id: "1", title: "Shop All", url: "/shop", position: 1, children: [] },
  { id: "2", title: "Apparel", url: "/shop?category=apparel", position: 2, children: [] },
  { id: "3", title: "Accessories", url: "/shop?category=accessories", position: 3, children: [] },
  { id: "4", title: "Home Living", url: "/shop?category=living", position: 4, children: [] },
  { id: "5", title: "FAQ", url: "/faq", position: 5, children: [] },
];

const DEFAULT_FOOTER_ITEMS: MenuItemData[] = [
  { id: "f1", title: "Shop All", url: "/shop", position: 1, children: [] },
  { id: "f2", title: "FAQs & Help", url: "/faq", position: 2, children: [] },
  { id: "f3", title: "Privacy Policy", url: "/privacy", position: 3, children: [] },
  { id: "f4", title: "Terms of Service", url: "/terms", position: 4, children: [] },
  { id: "f5", title: "Contact Us", url: "/contact", position: 5, children: [] },
];

// Global cache to avoid excessive fetches across re-renders
const menuCache: Record<string, MenuItemData[]> = {};

export function useNavigation(menuName: "header" | "footer" | string) {
  const defaultItems = menuName === "header" ? DEFAULT_HEADER_ITEMS : DEFAULT_FOOTER_ITEMS;
  const [items, setItems] = useState<MenuItemData[]>(menuCache[menuName] || defaultItems);
  const [isLoading, setIsLoading] = useState(!menuCache[menuName]);

  useEffect(() => {
    let isMounted = true;

    async function fetchMenu() {
      try {
        const response = await api.get<{ success: boolean; data: NavigationMenuData }>(
          `/cms/menus/${menuName}`
        );

        if (response.success && response.data?.items && response.data.items.length > 0) {
          menuCache[menuName] = response.data.items;
          if (isMounted) {
            setItems(response.data.items);
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch ${menuName} menu from API, using default fallback:`, err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, [menuName]);

  return { items, isLoading };
}

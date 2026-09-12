"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, User, Sun, Moon, LogOut, Menu, X, ChevronDown, Package, Settings } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useNavigation, MenuItemData } from "@/hooks/useNavigation";
import { useTheme } from "@/hooks/useTheme";
import CartDrawer from "../cart/CartDrawer";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { initialize: initializeCart, getTotals } = useCart();
  const { user, isAuthenticated, fetchMe, logout } = useAuth();
  const { storeName, lightLogo, darkLogo, fetchSettings } = useSettings();
  const { items: navItems } = useNavigation("header");
  const { isDark, toggleTheme, initialize: initializeTheme, isMounted } = useTheme();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { itemsCount } = getTotals();

  // Initialize theme, settings and stores
  useEffect(() => {
    // Theme initialization
    initializeTheme();
    // Settings initialization
    fetchSettings();
    // Auth initialization
    fetchMe();
    // Cart initialization
    initializeCart();

    // Set search query if present in url
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      setSearchQuery(currentSearch);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/shop`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Determine logo to show
  const activeLogo = isDark ? (darkLogo || lightLogo) : (lightLogo || darkLogo);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Mobile menu button + Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 focus:outline-none transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <Link href="/" className="flex items-center gap-2.5">
                {activeLogo ? (
                  <img
                    src={activeLogo}
                    alt={storeName}
                    className="h-8 max-w-[160px] object-contain"
                    onError={(e) => {
                      // fallback to text if image fails to load
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : null}
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:via-purple-300 dark:to-purple-400 uppercase">
                  {storeName || "LUMIÈRE"}
                </span>
              </Link>
            </div>

            {/* Dynamic Main Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                return (
                  <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => hasChildren && setOpenDropdown(item.id)}
                    onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                  >
                    <Link
                      href={item.url || "#"}
                      className="inline-flex items-center gap-1 py-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>{item.title}</span>
                      {hasChildren && <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />}
                    </Link>

                    {/* Submenu Dropdown */}
                    {hasChildren && openDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.children?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.url}
                            className="block px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-indigo-400 transition-colors"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={`Search ${storeName || "store"} collections...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 rounded-full pl-9 pr-4 text-sm bg-zinc-100 hover:bg-zinc-200/70 focus:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800/70 dark:focus:bg-zinc-900/90 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none transition-all"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              </div>
            </form>

            {/* Actions: Theme Toggle, Cart Icon, Account */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 focus:outline-none transition-colors"
                aria-label="Toggle theme"
                title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isMounted ? (
                  isDark ? (
                    <Sun className="h-5 w-5 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
                  ) : (
                    <Moon className="h-5 w-5 text-zinc-600 transition-transform duration-200 rotate-0 hover:-rotate-12" />
                  )
                ) : (
                  <div className="h-5 w-5" />
                )}
              </button>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 focus:outline-none transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                    {itemsCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center gap-1 p-2 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 focus:outline-none transition-colors"
                  aria-label="User account"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {isAccountOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsAccountOpen(false)} />
                    <div className="absolute right-0 mt-2.5 w-52 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-40">
                      {isAuthenticated && user ? (
                        <>
                          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900 mb-1">
                            <p className="text-xs text-zinc-400">Signed in as</p>
                            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                              {user.firstName || user.email}
                            </p>
                          </div>
                          <Link
                            href="/account/profile"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/account/orders"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <Package className="h-4 w-4" />
                            <span>Order History</span>
                          </Link>
                          <Link
                            href="/account/addresses"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Manage Addresses</span>
                          </Link>
                          <button
                            onClick={() => {
                              setIsAccountOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors mt-1 border-t border-zinc-100 dark:border-zinc-900 pt-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Log Out</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/account/login"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <span>Log In</span>
                          </Link>
                          <Link
                            href="/account/register"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50/50 dark:text-indigo-400 dark:hover:bg-indigo-950/20 transition-colors"
                          >
                            <span>Create Account</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search bar */}
          <div className="md:hidden py-3 border-t border-zinc-100 dark:border-zinc-900 flex">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-full pl-9 pr-4 text-sm bg-zinc-100 focus:bg-white dark:bg-zinc-900 dark:focus:bg-zinc-900/90 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            </form>
          </div>
        </div>

        {/* Mobile Navigation Menu Slider */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4 px-6 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
            {navItems.map((item) => (
              <div key={item.id} className="space-y-1">
                <Link
                  href={item.url || "#"}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600"
                >
                  {item.title}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="pl-4 space-y-2 border-l border-zinc-200 dark:border-zinc-800 ml-1 mt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Slide-out Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

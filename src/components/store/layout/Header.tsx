'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { useStoreSettings } from '@/context/store-settings-context';
import { TopBar } from './TopBar';
import { getValidImageUrl } from '@/lib/image-fallback';
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Grid,
  Truck,
  Home,
  ShoppingBag,
  BookOpen,
  Mail,
} from 'lucide-react';
import { getProducts, getCategories, getStoreSettings, filterNonEmptyCategories } from '@/lib/db/db-provider';
import { Product, Category } from '@/types';

export function Header() {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { itemCount, subtotal, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const { t } = useTranslation();
  const { settings: globalSettings } = useStoreSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [Kategorien, setCategories] = useState<Category[]>([]);
  const [Einstellungen, setSettings] = useState<{ store_name?: string; logo_url?: string } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, s] = await Promise.all([
          getCategories(),
          getProducts(),
          getStoreSettings(),
        ]);
        setAllProducts(prods);
        setCategories(filterNonEmptyCategories(cats, prods));
        setSettings(s);
      } catch {
        // Fallback
      }
    }
    loadData();
  }, []);

  // Instant real-time search filter over memory Produkte
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const matches = allProducts.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const catMatch = p.category_name?.toLowerCase().includes(q);
      const brandMatch = p.brand_name?.toLowerCase().includes(q);
      const skuMatch = p.sku?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      return nameMatch || catMatch || brandMatch || skuMatch || descMatch;
    });

    setSearchResults(matches);
  }, [searchQuery, allProducts]);

  // Click-outside listener to close live search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
    }
  }, [searchQuery, router]);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-border-soft dark:border-slate-800 shadow-small transition-colors duration-300">
      <TopBar />

      <div className="mx-auto w-full max-w-[1360px] px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px] sm:h-[68px] gap-2 sm:gap-4">
          {/* Mobile / Responsive Menu Button (< 1280px) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Navigation Menu"
            className="xl:hidden p-2.5 text-text-primary focus:outline-none rounded-lg hover:bg-surface-soft touch-target"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* GudPreiss Logo */}
          <Link href="/" className="flex items-center gap-2">
            {globalSettings?.logo_url && globalSettings.logo_url !== '/logo.png' ? (
              <Image
                src={globalSettings.logo_url}
                alt={globalSettings.store_name || 'Store'}
                width={180}
                height={36}
                className="h-8 sm:h-9 max-w-[180px] object-contain"
              />
            ) : (
              <span className="text-[22px] sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white leading-none">
                <span className="text-emerald-800 dark:text-emerald-700">
                  {globalSettings?.store_name ? globalSettings.store_name.slice(0, Math.ceil(globalSettings.store_name.length / 2)) : 'Tech'}
                </span>
                {globalSettings?.store_name ? globalSettings.store_name.slice(Math.ceil(globalSettings.store_name.length / 2)) : 'nova'}
              </span>
            )}
          </Link>

          {/* Desktop Nav Links Center (>= 1280px) */}
          <nav className="hidden xl:flex items-center gap-7 font-bold text-[14px] text-emerald-800 dark:text-emerald-700">
            <Link href="/" className="hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
              <Home className="w-4 h-4 text-emerald-700 dark:text-emerald-700" />
              <span>{t('nav.home')}</span>
            </Link>

            <div
              className="relative py-5"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link href="/shop" className="flex items-center gap-1.5 hover:text-emerald-600 transition font-bold">
                <ShoppingBag className="w-4 h-4 text-emerald-700 dark:text-emerald-700" />
                <span>{t('nav.shop')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-700" />
              </Link>

              {isShopDropdownOpen && (
                <div className="absolute top-full left-0 w-80 max-h-[460px] overflow-y-auto bg-white dark:bg-slate-950 border border-border-soft dark:border-slate-800/80 rounded-xl shadow-card p-3 grid grid-cols-1 gap-1 z-50 animate-in fade-in duration-150">
                  <Link
                    href="/shop"
                    onClick={() => setIsShopDropdownOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-700 font-extrabold text-[13px] mb-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Grid className="w-4 h-4" />
                      <span>Alle Kategorien ({Kategorien.length})</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  {Kategorien.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-900/60 text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-700 transition text-[13px] font-medium"
                    >
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/track" className="hover:text-emerald-600 transition flex items-center gap-1.5 font-black text-emerald-800 dark:text-emerald-700">
              <Truck className="w-4 h-4 text-emerald-700 dark:text-emerald-700" />
              <span>Sendungsverfolgung</span>
            </Link>

            <Link href="/contact" className="hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
              <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-700" />
              <span>{t('nav.contact')}</span>
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Desktop Real-time Live Search Bar (>= 1280px) */}
            <div ref={searchContainerRef} className="relative hidden xl:block z-50">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder={t('nav.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-52 xl:w-72 pl-9 pr-8 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-full text-[13px] text-slate-900 placeholder:text-slate-500 outline-none transition-all shadow-2xs focus:shadow-md font-medium"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute left-3 text-slate-500 hover:text-emerald-700 transition"
                >
                  <Search className="w-4 h-4" />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-0.5 text-slate-500 hover:text-slate-600 transition rounded-full"
                    aria-label="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Instant Live Search Results Dropdown */}
              {searchQuery.trim() && isSearchFocused && (
                <div className="absolute top-full right-0 w-80 sm:w-96 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Live-Suche</span>
                    <span className="text-emerald-700 font-extrabold">{searchResults.length} Produkt(e)</span>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto space-y-1 py-1">
                    {searchResults.length > 0 ? (
                      searchResults.slice(0, 6).map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/shop/${prod.slug}`}
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition group"
                        >
                          <div className="relative w-12 h-12 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                            <Image src={getValidImageUrl(prod.images[0], prod.category_id || prod.category_name)} alt={prod.name} fill className="object-contain p-1 group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[10px] font-bold uppercase text-emerald-800 truncate">{prod.category_name || 'GudPreiss'}</p>
                            <p className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-700 transition truncate">{prod.name}</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[12px] font-extrabold text-slate-900">{prod.price.toLocaleString('de-DE')} €</span>
                              {prod.compare_at_price && prod.compare_at_price > prod.price && (
                                <span className="text-[10px] text-slate-500 line-through">{prod.compare_at_price.toLocaleString('de-DE')} €</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-[13px] font-semibold text-slate-700">Keine Produkte gefunden</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Versuchen Sie einen anderen Suchbegriff</p>
                      </div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-center py-2.5 mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[12px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Alle {searchResults.length} Ergebnisse anzeigen</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile / Responsive Search Toggle Button (< 1280px) */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="xl:hidden p-2 text-text-primary hover:text-primary-500 transition"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon Button */}
            <Link
              href="/wishlist"
              className="relative p-2 text-text-primary hover:text-primary-500 transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-status-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Profile / Admin Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-surface-soft transition text-[12px] font-semibold text-text-primary"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-50 text-primary-600 font-bold flex items-center justify-center border border-primary-200 text-xs">
                    {(user.full_name || user.email || 'User').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-text-muted" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-text-primary hover:text-primary-500 transition flex items-center gap-1 text-[13px] font-medium"
                  aria-label="Anmelden"
                >
                  <User className="w-5 h-5" />
                  <span className="sr-only">Anmelden</span>
                </Link>
              )}

              {isUserDropdownOpen && user && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border-soft rounded-md shadow-card p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-border-soft mb-1">
                    <p className="font-bold text-xs text-text-primary truncate">{user.full_name || user.email}</p>
                    <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-[12px] text-primary-600 font-semibold hover:bg-primary-50 rounded transition"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>{t('nav.adminDashboard')}</span>
                    </Link>
                  )}

                  <Link
                    href="/account/Bestellungen"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[12px] text-text-primary hover:bg-surface-soft rounded transition"
                  >
                    <span>Meine Bestellungen</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12px] text-status-danger hover:bg-red-50 rounded transition mt-1 border-t border-border-soft"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Warenkorb ${subtotal.toFixed(2)} €`}
              className="flex items-center gap-2 p-2 text-slate-900 dark:text-white hover:text-emerald-800 dark:hover:text-emerald-700 transition cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-small">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold text-[13px]">{subtotal.toFixed(2)} €</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay Bar (< 1280px) */}
      {isMobileSearchOpen && (
        <div className="xl:hidden border-t border-border-soft p-3 bg-surface-soft">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-full text-[13px] text-slate-900 outline-none focus:border-emerald-600 shadow-2xs font-medium"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {searchQuery.trim() && (
            <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-[300px] overflow-y-auto">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                <span>Ergebnisse</span>
                <span className="text-emerald-700 font-extrabold">{searchResults.length} Produkt(e)</span>
              </div>
              {searchResults.length > 0 ? (
                searchResults.slice(0, 5).map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/shop/${prod.slug}`}
                    onClick={() => {
                      setSearchQuery('');
                      setIsMobileSearchOpen(false);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition text-left"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">                       <Image src={getValidImageUrl(prod.images[0], prod.category_id || prod.category_name)} alt={prod.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase text-emerald-800 truncate">{prod.category_name || 'GudPreiss'}</p>
                      <p className="text-[12px] font-semibold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[11px] font-bold text-slate-900">{prod.price.toLocaleString('de-DE')} €</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="p-3 text-[12px] text-slate-500 text-center">Keine Produkte gefunden.</p>
              )}
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                    setIsMobileSearchOpen(false);
                  }}
                  className="w-full text-center py-2 mt-1 bg-emerald-50 text-emerald-800 font-extrabold text-[12px] rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Alle Ergebnisse anzeigen ({searchResults.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] xl:hidden">
          {/* Semi-transparent Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="fixed top-0 left-0 bottom-0 w-[290px] max-w-[85vw] bg-white z-[1000] flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="overflow-y-auto flex-1">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-[20px] font-black text-slate-900 tracking-tight">
                  <span className="text-emerald-800">Gud</span>Preiss
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-3 space-y-1 font-semibold text-[14px] text-slate-800">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition"
                >
                  <span>{t('nav.home')}</span>
                </Link>

                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition"
                >
                  <span className="font-extrabold text-emerald-800">{t('nav.shop')}</span>
                  <Grid className="w-4 h-4 text-emerald-800" />
                </Link>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition text-left"
                  >
                    <span>{t('nav.Kategorien') || 'Kategorien'} ({Kategorien.length})</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isMobileCategoriesOpen && (
                    <div className="ml-3 pl-3 border-l-2 border-emerald-100 py-1 space-y-1 text-[13px] text-slate-600 max-h-60 overflow-y-auto">
                      <Link
                        href="/shop"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold"
                      >
                        <Grid className="w-4 h-4" />
                        <span>Alle Kategorien</span>
                      </Link>
                      {Kategorien.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block p-2 rounded-lg hover:bg-slate-100 truncate font-medium"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/track"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-slate-100 transition text-emerald-800 font-bold"
                >
                  <Truck className="w-4 h-4" />
                  <span>Sendungsverfolgung</span>
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-3 rounded-xl hover:bg-slate-100 transition"
                >
                  {t('nav.contact')}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 bg-emerald-100 text-emerald-900 font-extrabold rounded-xl transition mt-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('nav.adminDashboard')}</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Drawer Footer Account Info */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-900 truncate">{user.full_name || user.email}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl transition shadow-2xs"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs rounded-xl transition shadow-2xs"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

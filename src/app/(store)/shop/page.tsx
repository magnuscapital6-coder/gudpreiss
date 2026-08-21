'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/store/product/ProductCard';
import { getProducts, getCategories, getBrands, filterNonEmptyCategories } from '@/lib/db/db-provider';
import { Product, Category, Brand } from '@/types';
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedSort = searchParams.get('sort') || 'featured';
  const searchQueryParam = searchParams.get('search') || '';
  const onSaleOnly = searchParams.get('on_sale') === 'true';
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadShopData() {
      setIsLoading(true);
      const [prods, cats, brs, allProds] = await Promise.all([
        getProducts({
          categorySlug: selectedCategory,
          brandSlug: selectedBrand,
          search: searchQueryParam,
          onSale: onSaleOnly,
          maxPrice: priceRange,
          sort: selectedSort,
        }),
        getCategories(),
        getBrands(),
        getProducts(),
      ]);
      setProducts(prods);
      setCategories(filterNonEmptyCategories(cats, allProds));
      setBrands(brs);
      setIsLoading(false);
    }
    loadShopData();
  }, [selectedCategory, selectedBrand, searchQueryParam, selectedSort, onSaleOnly, priceRange]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <main className="flex-1 max-w-[1360px] mx-auto px-3 sm:px-6 w-full py-4 sm:py-6">
      {/* Breadcrumb & Header */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
          <span>{t('nav.home')}</span> &rarr; <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{t('nav.shop')}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              TechNova Store Katalog
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {products.length} Produkte verfügbar
            </p>
          </div>

          {/* Mobile Filter Toggle & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs touch-target"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Filtres</span>
            </button>

            {/* Sort Selector */}
            <select
              value={selectedSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 px-3 py-2 outline-none focus:border-emerald-800 dark:focus:border-emerald-500 shadow-xs flex-1 sm:flex-none"
            >
              <option value="featured">Empfohlen</option>
              <option value="newest">Neueste</option>
              <option value="price-asc">Preis: Aufsteigend</option>
              <option value="price-desc">Preis: Absteigend</option>
              <option value="rating">Beste Bewertung</option>
            </select>

            {/* Grid vs List Toggle */}
            <div className="hidden sm:flex border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-300 ${viewMode === 'grid' ? 'bg-emerald-800 dark:bg-emerald-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-300 ${viewMode === 'list' ? 'bg-emerald-800 dark:bg-emerald-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Sidebar Filters Drawer / Bottom Sheet */}
        <aside className={`lg:col-span-3 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5 ${
          isMobileFilterOpen ? 'block fixed inset-0 z-50 overflow-y-auto m-0 sm:m-4 rounded-none sm:rounded-2xl bg-white dark:bg-slate-950' : 'hidden lg:block'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Katalog-Filter</span>
            </h3>
            {isMobileFilterOpen && (
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5">Kategorien</h4>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <button
                onClick={() => { updateParam('category', ''); setIsMobileFilterOpen(false); }}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition ${!selectedCategory ? 'bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-400 font-extrabold' : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 font-medium'}`}
              >
                Alle Kategorien
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { updateParam('category', cat.slug); setIsMobileFilterOpen(false); }}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg transition ${selectedCategory === cat.slug ? 'bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-400 font-extrabold' : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 font-medium'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5">Marken</h4>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <button
                onClick={() => { updateParam('brand', ''); setIsMobileFilterOpen(false); }}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition ${!selectedBrand ? 'bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-400 font-extrabold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'}`}
              >
                Alle Marken
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { updateParam('brand', b.name); setIsMobileFilterOpen(false); }}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg transition ${selectedBrand.toLowerCase() === b.name.toLowerCase() ? 'bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-400 font-extrabold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'}`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Maximalpreis</span>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-400">{priceRange} €</span>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-emerald-800 dark:accent-emerald-400"
            />
          </div>

          {/* Special Deals Checkbox */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => { updateParam('on_sale', e.target.checked ? 'true' : ''); setIsMobileFilterOpen(false); }}
                className="rounded text-emerald-800 focus:ring-emerald-800"
              />
              <span>Nur Sonderangebote / Rabatte</span>
            </label>
          </div>
        </aside>

        {/* Main Products Grid */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
              Katalog wird geladen...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Keine Produkte gefunden</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Versuchen Sie, die Filter zurückzusetzen, um alle Artikel anzuzeigen.</p>
              <button
                onClick={() => router.push('/shop')}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
              >
                Alle Filter zurücksetzen
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} variant="horizontal" />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <CartDrawer />
      <Suspense fallback={<div className="p-8 text-center text-xs">Shop wird geladen...</div>}>
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  );
}

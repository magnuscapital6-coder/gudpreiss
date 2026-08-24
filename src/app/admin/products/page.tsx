'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit3, Trash2 } from 'lucide-react';
import { getProducts, deleteProduct } from '@/lib/db/db-provider';
import { Product } from '@/types';
import { useTranslation } from '@/context/language-context';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const [Produkte, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie dieses Produkt wirklich löschen?')) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  const filteredProducts = Produkte.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('admin.Produkte')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verwalten Sie den Produktkatalog, Preise und Bestände Ihres Shops ({filteredProducts.length} Produkte).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/import-pipeline"
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition touch-target"
          >
            <span>Import Pipeline</span>
          </Link>
          <Link
            href="/admin/products/image-verification"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition touch-target"
          >
            <span>Bild-Verifizierung</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.addProduct')}</span>
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Nach Name oder SKU suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Products Data Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 max-w-[320px]">Produkt</th>
                <th className="py-3 px-3 w-36">SKU</th>
                <th className="py-3 px-3 w-28">Preis</th>
                <th className="py-3 px-3 w-28">Bestand</th>
                <th className="py-3 px-4 w-24 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Produktkatalog wird geladen...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Keine Produkte gefunden.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 max-w-[320px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          <Image src={p.images[0]} alt="" fill className="object-contain p-1" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 dark:text-white truncate text-xs" title={p.name}>{p.name}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{p.category_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] w-36 truncate" title={p.sku || ''}>
                      {p.sku || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap w-28">
                      {p.price.toLocaleString('de-DE')} €
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap w-28">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.stock > 5
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}>
                        {p.stock} Stk.
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap w-24">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                          aria-label="Bearbeiten"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                          aria-label="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit3, Trash2, ExternalLink } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('admin.Produkte')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verwalten Sie den Produktkatalog, Preise und Bestände Ihres Shops.
          </p>
        </div>

        <Link
          href="/admin/Produkte/new"
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addProduct')}</span>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <input
          type="text"
          placeholder="Nach Name oder SKU suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 outline-none"
        />
      </div>

      {/* Products Data Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5 pl-5">Produkt</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Preis</th>
                <th className="p-3.5">Bestand</th>
                <th className="p-3.5 pr-5 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
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
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-10 h-10 relative bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                          <Image src={p.images[0]} alt="" fill className="object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{p.name}</p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{p.category_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{p.sku || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-slate-900">{p.price.toLocaleString('de-DE')} €</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.stock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {p.stock} auf Lager
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/Produkte/${p.id}/edit`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Bearbeiten"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
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

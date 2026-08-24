'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit3, Trash2, Package } from 'lucide-react';
import { getProducts, deleteProduct } from '@/lib/db/db-provider';
import { Product } from '@/types';
import { useTranslation } from '@/context/language-context';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Produktkatalog ({filteredProducts.length} Produkte)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verwalten Sie Produktpreise, Beschreibungen und Bildzuweisungen im Shop.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/import-pipeline"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
          >
            <span>Import Pipeline</span>
          </Link>
          <Link
            href="/admin/products/image-verification"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
          >
            <span>Bild-Verifizierung</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Produkt</span>
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Nach Name oder SKU suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Products Data Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-56">Produkt</th>
                <th className="py-2.5 px-3 w-32">SKU</th>
                <th className="py-2.5 px-3 w-28 text-right">Preis</th>
                <th className="py-2.5 px-3 w-24 text-center">Bestand</th>
                <th className="py-2.5 px-3 text-right w-24">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Produktkatalog wird geladen...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Keine Produkte gefunden.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const truncatedName = p.name.length > 28 ? p.name.substring(0, 28) + '...' : p.name;
                  const truncatedSku = p.sku ? (p.sku.length > 18 ? p.sku.substring(0, 18) + '...' : p.sku) : 'N/A';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 relative bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt="" fill className="object-contain p-0.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[8px]">N/A</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate text-xs" title={p.name}>{truncatedName}</p>
                            <span className="text-[9px] text-slate-400 uppercase truncate block">{p.category_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px] truncate" title={p.sku || ''}>
                        {truncatedSku}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 text-right">
                        {p.price.toLocaleString('de-DE')} €
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          p.stock > 5
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {p.stock} Stk.
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                            title="Bearbeiten"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getProducts, updateProduct } from '@/lib/db/db-provider';
import { Product } from '@/types';
import { Warehouse, Search, Minus, Plus, AlertCircle, CheckCircle2, PackageX } from 'lucide-react';
import Image from 'next/image';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const prods = await getProducts();
      setProducts(prods);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: validStock } : p)));
    await updateProduct(productId, { stock: validStock });
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Lagerbestand &amp; Inventar (Inventory Management)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Überwachen Sie Bestandslevels in Echtzeit und tätigen Sie schnelle Anpassungen ({filtered.length} Produkte).
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Nach SKU oder Produktname suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Compact Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 w-12">Bild</th>
                <th className="py-2.5 px-3 w-32 font-mono">SKU</th>
                <th className="py-2.5 px-3">Produktname</th>
                <th className="py-2.5 px-3 w-28">Status</th>
                <th className="py-2.5 px-3 w-24 text-center">Bestand</th>
                <th className="py-2.5 px-3 text-right w-44">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => {
                const isLowStock = p.stock <= (p.low_stock_threshold || 5) && p.stock > 0;
                const isOutOfStock = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    {/* Thumbnail */}
                    <td className="py-2 px-3">
                      <div className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden relative bg-slate-100 dark:bg-slate-950 flex-shrink-0">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {p.sku}
                    </td>

                    {/* Product Name */}
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {p.name}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                          <PackageX className="w-3 h-3" /> Ausverkauft
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Knapp
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Auf Lager
                        </span>
                      )}
                    </td>

                    {/* Stock Value */}
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {p.stock} Stk.
                    </td>

                    {/* Compact Quick Buttons */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStockUpdate(p.id, p.stock - 1)}
                          title="-1 Bestand"
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition text-[11px] font-bold rounded-lg text-slate-700 dark:text-slate-300"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockUpdate(p.id, p.stock - 5)}
                          title="-5 Bestand"
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition text-[11px] font-bold rounded-lg text-slate-700 dark:text-slate-300"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleStockUpdate(p.id, p.stock + 5)}
                          title="+5 Bestand"
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition text-[11px] font-bold rounded-lg text-slate-700 dark:text-slate-300"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockUpdate(p.id, p.stock + 10)}
                          title="+10 Nachbestellen"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-lg shadow-xs transition"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

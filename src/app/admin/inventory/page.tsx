'use client';

import React, { useState, useEffect } from 'react';
import { getProducts, updateProduct } from '@/lib/db/db-provider';
import { Product } from '@/types';
import { Warehouse, Search, Save, AlertTriangle } from 'lucide-react';

export default function AdminInventoryPage() {
  const [Produkte, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const prods = await getProducts();
      setProducts(prods);
    }
    load();
  }, []);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    const updated = await updateProduct(productId, { stock: Math.max(0, newStock) });
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    }
  };

  const filtered = Produkte.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Lagerbestand & Inventar</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Überwachen Sie Bestandslevels in Echtzeit, passen Sie Schwellenwerte an und tätigen Sie Nachbestellungen.
        </p>
      </div>

      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <input
          type="text"
          placeholder="Nach SKU oder Produktnamen suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none placeholder-slate-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-4">SKU-Code</th>
              <th className="p-4">Produktname</th>
              <th className="p-4">Aktueller Bestand</th>
              <th className="p-4">Meldebestand</th>
              <th className="p-4 text-right">Bestand anpassen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/50">
                <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{p.sku}</td>
                <td className="p-4 font-bold text-white">{p.name}</td>
                <td className="p-4 font-bold">
                  <span className={p.stock <= p.low_stock_threshold ? 'text-orange-400 font-extrabold' : 'text-green-700 dark:text-green-400'}>
                    {p.stock} Stück
                  </span>
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{p.low_stock_threshold} Stück</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleStockUpdate(p.id, p.stock - 5)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:text-white"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleStockUpdate(p.id, p.stock + 10)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
                    >
                      +10 Nachbestellen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

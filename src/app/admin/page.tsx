'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { getOrders, getProducts } from '@/lib/db/db-provider';
import { Order, Product } from '@/types';

// Lazy-load the heavy KPI cards and table that use framer-motion
const AdminKpiCards = dynamic(
  () => import('@/components/admin/AdminKpiCards').then((m) => m.AdminKpiCards),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200/80 h-32 animate-pulse" />
        ))}
      </div>
    ),
  }
);

const AdminRecentOrders = dynamic(
  () => import('@/components/admin/AdminRecentOrders').then((m) => m.AdminRecentOrders),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-3xl border border-slate-200/80 h-64 animate-pulse" />
    ),
  }
);

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealDashboardData();
  }, []);

  async function loadRealDashboardData() {
    setIsLoading(true);
    try {
      const fetchedOrders = await getOrders();
      let localOrders: Order[] = [];
      try {
        const saved = localStorage.getItem('gudpreiss_orders');
        if (saved) localOrders = JSON.parse(saved);
      } catch {
        // ignore
      }

      const orderMap = new Map<string, Order>();
      localOrders.forEach((o) => {
        if (o && (o.order_number || o.id)) orderMap.set(o.order_number || o.id, o);
      });
      fetchedOrders.forEach((o) => {
        if (o && (o.order_number || o.id)) orderMap.set(o.order_number || o.id, o);
      });

      const combinedOrders = Array.from(orderMap.values());
      setOrders(combinedOrders);

      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch {
      // Silent error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {t('admin.dashboard')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
              Live-Daten
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1">
            Verkaufs-, Bestands- und Kundenstatistiken in Echtzeit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRealDashboardData}
            className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 dark:text-slate-300 transition cursor-pointer"
            aria-label="Daten aktualisieren"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.addProduct')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards + Recent Orders (dynamically loaded) */}
      <AdminKpiCards orders={orders} products={products} />
      <AdminRecentOrders orders={orders} />
    </div>
  );
}

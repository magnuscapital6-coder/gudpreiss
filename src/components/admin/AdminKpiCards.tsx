'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { useTranslation } from '@/context/language-context';
import { Order, Product } from '@/types';

interface AdminKpiCardsProps {
  orders: Order[];
  products: Product[];
}

export function AdminKpiCards({ orders, products }: AdminKpiCardsProps) {
  const { t } = useTranslation();

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalOrdersCount = orders.length;
  const activeProductsCount = products.length;
  const lowStockCount = products.filter((p) => (p.stock !== undefined ? p.stock < 5 : false)).length;

  const kpis = [
    {
      title: t('admin.totalRevenue'),
      numeric: totalRevenue,
      prefix: '€',
      suffix: '.00',
      change: '+100% Echtzeit-Daten',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20',
    },
    {
      title: t('admin.totalOrders'),
      numeric: totalOrdersCount,
      change: `${totalOrdersCount} Bestellungen`,
      icon: ShoppingBag,
      color: 'text-teal-500 bg-teal-500/10 border border-teal-500/20',
    },
    {
      title: t('admin.activeProducts'),
      numeric: activeProductsCount,
      change: 'Im Katalog',
      icon: Package,
      color: 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20',
    },
    {
      title: t('admin.lowStockAlerts'),
      numeric: lowStockCount,
      suffix: ' Artikel',
      change: lowStockCount > 0 ? 'Nachbestellung nötig' : 'Bestand OK',
      icon: AlertTriangle,
      color: 'text-amber-500 bg-amber-500/10 border border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.35 }}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{kpi.title}</span>
              <div className={`p-2 rounded-2xl ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black">
                <AnimatedCounter
                  value={kpi.numeric}
                  prefix={kpi.prefix}
                  suffix={kpi.suffix}
                />
              </h3>
              <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {kpi.change}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

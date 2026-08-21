'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { Order } from '@/types';

interface AdminRecentOrdersProps {
  orders: Order[];
}

export function AdminRecentOrders({ orders }: AdminRecentOrdersProps) {
  const { t } = useTranslation();

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime())
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-sm">{t('admin.recentOrders')} ({recentOrders.length})</h2>
          <p className="text-[11px] text-slate-400">Neueste Bestellungen aus dem Shop</p>
        </div>

        <Link
          href="/admin/orders"
          className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Alle Bestellungen anzeigen</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-bold">
            Noch keine Bestellungen vorhanden.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 pl-6">Bestell-Nr.</th>
                <th className="p-4">Kunde</th>
                <th className="p-4">Datum</th>
                <th className="p-4">Betrag</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {recentOrders.map((ord) => (
                <tr key={ord.id || ord.order_number} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 pl-6 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    {ord.order_number || ord.id}
                  </td>
                  <td className="p-4 font-bold">
                    {ord.shipping_address?.full_name || ord.customer_email}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {new Date(ord.created_at || Date.now()).toLocaleString('de-DE')}
                  </td>
                  <td className="p-4 font-black text-slate-900 dark:text-white">
                    {(ord.total_amount || 0).toFixed(2)} €
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                      {ord.order_status || 'Bezahlt'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}

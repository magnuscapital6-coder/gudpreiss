'use client';

import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/db/db-provider';
import { Order } from '@/types';
import { ShoppingBag, Search, Eye, CheckCircle2, Truck, Printer, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [Bestellungen, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadOrders() {
      const ords = await getOrders();
      setOrders(ords);
    }
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['order_status']) => {
    const updated = await updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
  };

  const filteredOrders = Bestellungen.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Bestellverwaltung & Versand</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sehen Sie Bestellungen ein, aktualisieren Sie den Status und drucken Sie Rechnungen.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Nach Bestellnr. oder Kunden-E-Mail suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 outline-none font-bold"
          >
            <option value="all">Alle Status</option>
            <option value="pending">Ausstehend</option>
            <option value="processing">In Bearbeitung</option>
            <option value="shipped">Versendet</option>
            <option value="delivered">Zugestellt</option>
            <option value="cancelled">Storniert</option>
          </select>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Bestellnr.</th>
                <th className="p-4">Kunde</th>
                <th className="p-4">Zahlung</th>
                <th className="p-4">Gesamt</th>
                <th className="p-4">Bestellstatus</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-blue-700 dark:text-blue-400">{order.order_number}</td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{order.customer_email}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(order.created_at).toLocaleDateString('de-DE')}</div>
                  </td>
                  <td className="p-4 uppercase font-bold text-[10px]">
                    <span className="bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md">
                      {order.payment_method} ({order.payment_status === 'paid' ? 'Bezahlt' : order.payment_status})
                    </span>
                  </td>
                  <td className="p-4 font-black text-white">{order.total_amount.toFixed(2)} €</td>
                  <td className="p-4">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1 outline-none"
                    >
                      <option value="pending">Ausstehend</option>
                      <option value="confirmed">Bestätigt</option>
                      <option value="processing">In Bearbeitung</option>
                      <option value="shipped">Versendet</option>
                      <option value="delivered">Zugestellt</option>
                      <option value="cancelled">Storniert</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => window.print()}
                      title="Rechnung drucken"
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/db/db-provider';
import { Order } from '@/types';
import { ShoppingBag, Search, Eye, CheckCircle2, Truck, Printer, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
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

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bestellverwaltung ({filteredOrders.length} Bestellungen)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sehen Sie Bestellungen ein, aktualisieren Sie den Versandstatus und exportieren Sie Dokumente.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Nach Bestellnr. oder Kunden-E-Mail suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 px-3 py-2 outline-none font-bold"
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

      {/* Compact Order Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-32">Bestellnr.</th>
                <th className="py-2.5 px-3 w-48">Kunde &amp; Datum</th>
                <th className="py-2.5 px-3 w-28">Zahlung</th>
                <th className="py-2.5 px-3 w-24 text-right">Gesamt</th>
                <th className="py-2.5 px-3 w-32">Status</th>
                <th className="py-2.5 px-3 text-right w-24">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Keine Bestellungen gefunden.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const truncatedEmail = order.customer_email.length > 22
                    ? order.customer_email.substring(0, 22) + '...'
                    : order.customer_email;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 truncate" title={order.order_number}>
                        {order.order_number}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 truncate text-xs" title={order.customer_email}>
                          {truncatedEmail}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </td>
                      <td className="py-2 px-3 uppercase font-bold text-[10px]">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {order.payment_method || 'Bezahlt'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 text-right">
                        {order.total_amount.toLocaleString('de-DE')} €
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['order_status'])}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 outline-none"
                        >
                          <option value="pending">Ausstehend</option>
                          <option value="processing">In Bearbeitung</option>
                          <option value="shipped">Versendet</option>
                          <option value="delivered">Zugestellt</option>
                          <option value="cancelled">Storniert</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Rechnung drucken"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
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

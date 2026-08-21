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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Gestion & Expédition des Commandes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Consultez les commandes, mettez à jour leur statut et imprimez les factures.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher par N° de commande ou email client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 outline-none font-bold"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">N° Commande</th>
                <th className="p-4">Client</th>
                <th className="p-4">Paiement</th>
                <th className="p-4">Total</th>
                <th className="p-4">Statut Commande</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-blue-400">{order.order_number}</td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{order.customer_email}</div>
                    <div className="text-[10px] text-slate-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="p-4 uppercase font-bold text-[10px]">
                    <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-md">
                      {order.payment_method} ({order.payment_status === 'paid' ? 'Payé' : order.payment_status})
                    </span>
                  </td>
                  <td className="p-4 font-black text-white">{order.total_amount.toFixed(2)} €</td>
                  <td className="p-4">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1 outline-none"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="processing">En traitement</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => window.print()}
                      title="Imprimer la facture"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
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

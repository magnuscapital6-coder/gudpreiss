'use client';

import React, { useState, useEffect } from 'react';
import { getAdminOrdersServerAction, updateOrderStatusServerAction } from '@/app/actions/store-actions';
import { getOrders, updateOrderStatus } from '@/lib/db/db-provider';
import { Order } from '@/types';
import { ShoppingBag, Search, Eye, CheckCircle2, Truck, Printer, Clock, RefreshCw, X, Package, MapPin, CreditCard, Mail, Phone, ExternalLink } from 'lucide-react';
import { useToast } from '@/context/toast-context';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const toast = useToast();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // 1. Try Server Action first
      const res = await getAdminOrdersServerAction();
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else {
        // 2. Fallback to client provider
        const ords = await getOrders();
        setOrders(ords);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      const ords = await getOrders();
      setOrders(ords);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['order_status']) => {
    try {
      const res = await updateOrderStatusServerAction(orderId, newStatus);
      if (res.success && res.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId || o.order_number === orderId ? res.order! : o)));
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
          setSelectedOrder(res.order);
        }
        toast.success(`Status für Bestellung #${selectedOrder?.order_number || orderId} auf "${newStatus}" aktualisiert.`, 'Status aktualisiert');
      } else {
        const updated = await updateOrderStatus(orderId, newStatus);
        if (updated) {
          setOrders((prev) => prev.map((o) => (o.id === orderId || o.order_number === orderId ? updated : o)));
          if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
            setSelectedOrder(updated);
          }
          toast.success(`Status aktualisiert.`, 'Erfolg');
        }
      }
    } catch {
      toast.error('Fehler beim Aktualisieren des Status.', 'Fehler');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = search.toLowerCase();
    const matchSearch =
      (o.order_number && o.order_number.toLowerCase().includes(term)) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(term)) ||
      (o.shipping_address?.full_name && o.shipping_address.full_name.toLowerCase().includes(term));
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bestellverwaltung ({filteredOrders.length} Bestellungen)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sehen Sie alle eingegangenen Bestellungen ein, bearbeiten Sie den Status und drucken Sie Lieferscheine.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Nach Bestellnr., Name oder E-Mail suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 px-3.5 py-2.5 outline-none font-bold cursor-pointer hover:bg-slate-100 transition"
          >
            <option value="all">Alle Status ({orders.length})</option>
            <option value="pending">Ausstehend (pending)</option>
            <option value="processing">In Bearbeitung (processing)</option>
            <option value="shipped">Versendet (shipped)</option>
            <option value="delivered">Zugestellt (delivered)</option>
            <option value="cancelled">Storniert (cancelled)</option>
          </select>
        </div>
      </div>

      {/* Compact Order Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-32">Bestellnr.</th>
                <th className="py-3 px-4 w-52">Kunde &amp; Datum</th>
                <th className="py-3 px-4 w-32">Zahlungsart</th>
                <th className="py-3 px-4 w-28 text-right">Gesamt</th>
                <th className="py-3 px-4 w-36">Status</th>
                <th className="py-3 px-4 text-right w-28">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      Bestellungen werden geladen...
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Keine Bestellungen gefunden.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerName = order.shipping_address?.full_name || 'Kunde';
                  const truncatedEmail = order.customer_email && order.customer_email.length > 24
                    ? order.customer_email.substring(0, 24) + '...'
                    : order.customer_email;

                  return (
                    <tr key={order.id || order.order_number} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 truncate" title={order.order_number}>
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 truncate text-xs" title={customerName}>
                          {customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={order.customer_email}>
                          {truncatedEmail}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-[10px]">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md inline-block">
                          {order.payment_method === 'bank_transfer' ? 'Vorkasse / Überweisung' : (order.payment_method || 'Bezahlt')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 text-right text-xs">
                        {(order.total_amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['order_status'])}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold outline-none border ${
                            order.order_status === 'processing'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : order.order_status === 'shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.order_status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.order_status === 'cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="pending">Ausstehend</option>
                          <option value="processing">In Bearbeitung</option>
                          <option value="shipped">Versendet</option>
                          <option value="delivered">Zugestellt</option>
                          <option value="cancelled">Storniert</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Details ansehen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Rechnung drucken"
                          >
                            <Printer className="w-4 h-4" />
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Bestelldetails
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Bestellung #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Lieferadresse
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.shipping_address?.full_name || 'Kunde'}</p>
                  <p className="text-slate-600 mt-0.5">{selectedOrder.shipping_address?.address_line1}</p>
                  {selectedOrder.shipping_address?.address_line2 && (
                    <p className="text-slate-600">{selectedOrder.shipping_address.address_line2}</p>
                  )}
                  <p className="text-slate-600 font-medium">
                    {selectedOrder.shipping_address?.postal_code} {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.country || 'Deutschland'}
                  </p>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    Kontakt &amp; Tracking
                  </div>
                  <p className="text-slate-900 font-semibold">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-slate-600 mt-0.5">{selectedOrder.customer_phone}</p>
                  )}
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Tracking-Nummer:</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {selectedOrder.tracking_number || 'Wird vorbereitet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Bestellte Artikel ({selectedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{item.name || item.product_name || 'Produkt'}</p>
                          <p className="text-[11px] text-slate-400">
                            Menge: <span className="font-bold text-slate-700">{item.quantity}x</span> à {(item.price || item.unit_price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          {((item.price || item.unit_price || 0) * (item.quantity || 1)).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400">Keine Artikeldetails hinterlegt.</div>
                  )}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Zwischensumme:</span>
                  <span className="font-semibold text-slate-800">{(selectedOrder.subtotal || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Rabatt {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}:</span>
                    <span className="font-semibold">-{(selectedOrder.discount_amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Versandkosten:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOrder.shipping_fee === 0 ? 'Kostenlos' : `${(selectedOrder.shipping_fee || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Enthaltene MwSt. (19%):</span>
                  <span className="font-semibold text-slate-800">{(selectedOrder.tax_amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>Gesamtbetrag:</span>
                  <span className="text-emerald-700">{(selectedOrder.total_amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>

              {/* Status Update Select */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-xs">Bestellstatus:</span>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['order_status'])}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="pending">Ausstehend</option>
                    <option value="processing">In Bearbeitung</option>
                    <option value="shipped">Versendet</option>
                    <option value="delivered">Zugestellt</option>
                    <option value="cancelled">Storniert</option>
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Rechnung drucken</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

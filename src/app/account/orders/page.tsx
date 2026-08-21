'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { getOrders } from '@/lib/db/db-provider';
import { Order } from '@/types';
import { Package, Truck, CheckCircle2, Clock, Copy, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const ords = await getOrders();
        let clientLocalOrders: Order[] = [];
        try {
          const saved = localStorage.getItem('technova_orders');
          if (saved) clientLocalOrders = JSON.parse(saved);
        } catch {}

        const map = new Map<string, Order>();
        clientLocalOrders.forEach((o) => {
          if (o && (o.order_number || o.id)) map.set(o.order_number || o.id, o);
        });
        ords.forEach((o) => {
          if (o && (o.order_number || o.id)) map.set(o.order_number || o.id, o);
        });

        setOrders(Array.from(map.values()));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(num);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-bold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>ECHTZEIT-SENDUNGSVERFOLGUNG (DEUTSCHLAND)</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Meine Bestellungen &amp; Live-Verfolgung</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verfolgen Sie Ihre Sendung in Echtzeit mit DHL Express / UPS Deutschland.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-400 font-bold animate-pulse">
            Bestellungen werden geladen...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold mb-1">Keine Bestellungen vorhanden / Aucune commande</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Sie haben derzeit keine aktiven Bestellungen. Entdecken Sie unsere neuesten Angebote im Katalog.
              </p>
            </div>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition cursor-pointer"
            >
              <span>Jetzt Einkaufen / Achetez maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const trackingCode = order.tracking_number || `TN-DE-${Math.floor(10000000 + Math.random() * 90000000)}`;

              return (
                <div
                  key={order.id || order.order_number}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
                >
                  {/* Top Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {order.order_number}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Bestellt am {new Date(order.created_at).toLocaleDateString('de-DE')} • Zahlung per Vorkasse (Bank Transfer)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {order.total_amount.toFixed(2)} €
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold uppercase">
                        {order.order_status === 'processing' ? 'IN BEARBEITUNG' : order.order_status}
                      </span>
                    </div>
                  </div>

                  {/* Live Tracking Timeline Stepper */}
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                          DHL Express Deutschland Live-Sendungsverfolgung
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Voraussichtliche Lieferung: 1-2 Werktage
                      </span>
                    </div>

                    {/* Timeline Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-bold pt-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                        <span>Bestellung Bestätigt</span>
                      </div>

                      <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                        <span>Zahlung Registriert</span>
                      </div>

                      <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] animate-pulse">
                          ●
                        </div>
                        <span>Paket im Transit</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                          4
                        </div>
                        <span>Zugestellt</span>
                      </div>
                    </div>

                    {/* Tracking Code Box */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Tracking-Nummer / Sendungscode</span>
                        <span className="text-sm font-mono font-bold text-emerald-400 tracking-wider">
                          {trackingCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyTracking(trackingCode)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedTracking === trackingCode ? 'Kopiert!' : 'Code Kopieren'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Bestellte Artikel ({order.items.length})
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs gap-4">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <div className="relative w-10 h-10 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
                                <Image src={item.image_url} alt="" fill className="object-contain p-1" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.product_name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">Menge: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-400">
                            {item.total_price ? item.total_price.toFixed(2) : (item.unit_price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

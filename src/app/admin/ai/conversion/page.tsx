'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  BarChart2,
  ArrowUpRight,
  RefreshCw,
  Zap,
  ShieldAlert,
  Sliders,
  Filter,
} from 'lucide-react';
import { ConversionAnalytics, CartAbandonmentRecord } from '@/types/conversion';
import { getConversionAnalytics, getAbandonedCarts } from '@/lib/ai/conversion-engine';

export default function AdminConversionPage() {
  const [analytics, setAnalytics] = useState<ConversionAnalytics>(getConversionAnalytics());
  const [abandonedCarts, setAbandonedCarts] = useState<CartAbandonmentRecord[]>(getAbandonedCarts());
  const [filterObjection, setFilterObjection] = useState<string>('all');

  useEffect(() => {
    setAnalytics(getConversionAnalytics());
    setAbandonedCarts(getAbandonedCarts());
  }, []);

  const filteredCarts = abandonedCarts.filter(
    (c) => filterObjection === 'all' || c.objectionCause === filterObjection
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 p-6 rounded-3xl border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0 border border-emerald-400/30">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">Conversion Intelligence Gupreiss</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold rounded-full border border-emerald-500/30">
                Live AI Optimization
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verhaltensanalyse in Echtzeit, Ermittlung von Reibungspunkten, Abbruch-Prävention &amp; Umsatz-Attribution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Geförderter Umsatz</span>
            <span className="text-xl font-black text-emerald-400">
              +{analytics.gupreissAttributedRevenue.toLocaleString('de-DE')} €
            </span>
          </div>
        </div>
      </div>

      {/* Live Visitor Profiles Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Aktive Besucher</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics.activeVisitorsCount}</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8 Hohe Kaufabsicht (Purchase Intent &gt; 75)</span>
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase">Zögernde Besucher</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">
            {analytics.profileBreakdown.hesitant + analytics.profileBreakdown.comparing_offers}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Signal: 3+ Produktansichten &amp; Preisvergleiche
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase">Checkout Blockiert</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500">{analytics.profileBreakdown.checkout_blocked}</p>
          <p className="text-[11px] text-rose-600 font-bold">
            Hohes Abbruchrisiko (Abbruch-Score &gt; 65)
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase">KI-Conversions-Rate</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500">{analytics.conversionRateAssistedPercent} %</p>
          <p className="text-[11px] text-slate-400">
            vs. {analytics.conversionRateUnassistedPercent} % ohne KI (+64% Steigerung)
          </p>
        </div>
      </div>

      {/* Main Grid: Abandoned Carts & Objections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Abandoned Carts Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Erfasste Warenkorb-Abbrüche ({abandonedCarts.length})
              </h3>
              <p className="text-xs text-slate-500">
                Gesamtwert abbrechender Warenkörbe:{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {analytics.abandonedCartsTotalValue.toLocaleString('de-DE')} €
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterObjection}
                onChange={(e) => setFilterObjection(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
              >
                <option value="all">Alle Gründe</option>
                <option value="shipping_fee">Versandkosten</option>
                <option value="payment_method">Zahlungsmittel</option>
                <option value="product_comparison">Produktvergleich</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredCarts.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-emerald-600">{c.id}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.sessionId}</span>
                    {c.recovered ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-500/30">
                        Wiederhergestellt ({c.recoveredValue?.toFixed(2)} €)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 text-[10px] font-black rounded-full border border-rose-500/30">
                        Offen
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Inhalt:</span>{' '}
                    {c.cartContent.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">{c.cartValue.toFixed(2)} €</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">
                    Ursahe: <strong className="text-amber-600 uppercase">{c.objectionCause}</strong> (Letzter Schritt: {c.lastStep})
                  </span>
                  <span className="text-emerald-600 font-bold">
                    Kaufwahrscheinlichkeit: {c.conversionProbability}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Top Objections & Drop-off Pages */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Hauptsächliche Abbruchgründe (Objections)
            </h3>
            <div className="space-y-3">
              {analytics.topObjections.map((o, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{o.objection}</span>
                    <span className="font-black text-emerald-600">{o.count} Fälle</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (o.count / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Top Abbruchseiten (Drop-off Pages)
            </h3>
            <div className="space-y-2">
              {analytics.topDropoffPages.map((dp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {dp.page}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 font-extrabold rounded-md">
                    {dp.count} Abbrüche
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

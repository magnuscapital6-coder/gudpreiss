'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Mail,
  Megaphone,
  CheckCircle2,
  Copy,
  Trash2,
  Calendar,
  DollarSign,
  Share2,
  Loader2,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { getCoupons, createCoupon, updateCouponStatus, deleteCoupon, getOrders } from '@/lib/db/db-provider';
import { Coupon, Order } from '@/types';

export default function AdminMarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(50);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedCoupons, fetchedOrders] = await Promise.all([
        getCoupons(),
        getOrders(),
      ]);
      setCoupons(fetchedCoupons);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Fehler beim Laden der Marketing-Daten:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate real metrics from database
  const activeCouponsCount = coupons.filter((c) => c.active).length;

  // Real Coupon Revenue: sum total_amount of orders where coupon_code was used
  const realCouponRevenue = orders
    .filter((o) => o.coupon_code && o.coupon_code.trim() !== '')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Total store sales volume from real orders
  const totalStoreSales = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Real Customer Database Count (unique emails)
  const uniqueEmails = new Set(orders.map((o) => o.customer_email).filter(Boolean));
  const subscriberCount = uniqueEmails.size;

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createCoupon({
        code: newCode.trim().toUpperCase(),
        discount_type: 'percentage',
        discount_value: Number(newPercent),
        min_order_amount: Number(newMinOrder),
        active: true,
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });

      setCoupons((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setNewCode('');
      setSuccessMsg(`Gutscheincode "${created.code}" wurde erfolgreich in der Datenbank gespeichert!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Fehler beim Erstellen des Gutscheins.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCoupon = async (id: string, currentActive: boolean) => {
    const nextActive = !currentActive;
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: nextActive } : c)));
    try {
      await updateCouponStatus(id, nextActive);
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Gutscheinstatus:', err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Möchten Sie diesen Gutscheincode wirklich aus der Datenbank löschen?')) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCoupon(id);
    } catch (err) {
      console.error('Fehler beim Löschen des Gutscheins:', err);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Marketing &amp; Rabattaktionen (Marketing Center)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Echtzeit-Datenbank-Verwaltung für Gutscheincodes, Bestellrabatte und Marketing-Kennzahlen.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Analytics KPI Bar with Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Aktive Gutscheine</span>
            <Tag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : `${activeCouponsCount} / ${coupons.length}`}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {coupons.length > 0 ? 'Live in der Datenbank aktiv' : 'Keine Gutscheine vorhanden'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Registrierte Kunden (E-Mails)</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : subscriberCount}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Echte Kundendaten aus Bestellungen
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Gutschein-Umsatz</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : `${realCouponRevenue.toLocaleString('de-DE')} €`}
          </div>
          <div className="text-[11px] text-slate-400">
            Aus echten Gutschein-Bestellungen
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Gesamter Shop-Umsatz</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : `${totalStoreSales.toLocaleString('de-DE')} €`}
          </div>
          <div className="text-[11px] text-slate-400">
            Aus {orders.length} realen Bestellungen
          </div>
        </div>
      </div>

      {/* Main Grid: Coupons & Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Coupon List */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Aktive Gutscheincodes &amp; Rabatte ({coupons.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Gutscheine werden geladen...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-500">
              Keine Gutscheincodes in der Datenbank vorhanden.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-sm rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        {coupon.code}
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          title="Code kopieren"
                          className="text-slate-400 hover:text-emerald-500 transition cursor-pointer"
                        >
                          {copiedCode === coupon.code ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </span>

                      <span className="px-2.5 py-0.5 text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                        -{coupon.discount_value}% Rabatt
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>Mindestbestellwert: {coupon.min_order_amount} €</span>
                      <span>·</span>
                      <span>Echte Einlösungen: {coupon.times_used || 0}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Gültig bis: {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('de-DE') : 'Dauerhaft'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coupon.active}
                        onChange={() => handleToggleCoupon(coupon.id, coupon.active)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Quick Add Form */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Neuen Gutschein anlegen
          </h2>

          <form onSubmit={handleAddCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gutscheincode *
              </label>
              <input
                type="text"
                placeholder="z.B. SOMMER2026"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 font-mono uppercase text-slate-900 dark:text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rabatt (%) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newPercent}
                onChange={(e) => setNewPercent(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mindestbestellwert (€)
              </label>
              <input
                type="number"
                min="0"
                value={newMinOrder}
                onChange={(e) => setNewMinOrder(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Plus className="w-4 h-4 text-white" />
              )}
              <span>{isSubmitting ? 'WIRD GESPEICHERT...' : 'GUTSCHEIN SPEICHERN & AKTIVIEREN'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

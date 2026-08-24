'use client';

import React, { useState } from 'react';
import { Tag, Plus, Percent, Mail, Megaphone, CheckCircle2, Copy, Trash2, Calendar, DollarSign, Share2 } from 'lucide-react';
import { INITIAL_COUPONS } from '@/lib/db/initial-data';
import { Coupon } from '@/types';

export default function AdminMarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS || [
    {
      id: 'coupon-1',
      code: 'WILLKOMMEN10',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 50,
      times_used: 124,
      active: true,
      end_date: '2026-12-31T23:59:59.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'coupon-2',
      code: 'GUDPREISS20',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_amount: 150,
      times_used: 48,
      active: true,
      end_date: '2026-09-30T23:59:59.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'coupon-3',
      code: 'SOMMER2026',
      discount_type: 'percentage',
      discount_value: 15,
      min_order_amount: 100,
      times_used: 89,
      active: true,
      end_date: '2026-08-31T23:59:59.000Z',
      created_at: '2026-06-01T00:00:00.000Z',
    }
  ]);

  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(50);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discount_type: 'percentage',
      discount_value: Number(newPercent),
      min_order_amount: Number(newMinOrder),
      times_used: 0,
      active: true,
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    setCoupons([newCoupon, ...coupons]);
    setNewCode('');
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Möchten Sie diesen Gutscheincode wirklich löschen?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-7 h-7 text-emerald-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Marketing &amp; Rabattaktionen (Marketing Center)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gutscheincodes verwalten, E-Mail-Kampagnen analysieren und Konversionen steigern.
          </p>
        </div>

        <button
          onClick={() => {
            const code = prompt('Neuer Gutscheincode (z.B. SALE15):');
            if (code) {
              setCoupons([
                {
                  id: `coupon-${Date.now()}`,
                  code: code.trim().toUpperCase(),
                  discount_type: 'percentage',
                  discount_value: 15,
                  min_order_amount: 50,
                  times_used: 0,
                  active: true,
                  end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                  created_at: new Date().toISOString(),
                },
                ...coupons,
              ]);
            }
          }}
          className="px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Neuen Gutschein erstellen
        </button>
      </div>

      {/* Analytics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Aktive Gutscheine</span>
            <Tag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {coupons.filter(c => c.active).length} / {coupons.length}
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold">Live im Shop aktiv</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Newsletter Abonnenten</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">1.842</div>
          <div className="text-[11px] text-indigo-500 font-semibold">+12% diesen Monat</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Gutschein-Umsatz</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">14.850 €</div>
          <div className="text-[11px] text-slate-400">Durch Rabatt-Promotions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Google Shopping Feed</span>
            <Share2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">Aktiv</div>
          <div className="text-[11px] text-slate-400">Automatischer XML Feed</div>
        </div>
      </div>

      {/* Main Grid: Coupons & Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Coupon List */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-500" />
              Aktive Gutscheincodes &amp; Rabatte ({coupons.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {coupons.map(coupon => (
              <div key={coupon.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-sm rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      {coupon.code}
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        title="Code kopieren"
                        className="text-slate-400 hover:text-emerald-500 transition"
                      >
                        {copiedCode === coupon.code ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>

                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                      -{coupon.discount_value}% Rabatt
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Mindestbestellwert: {coupon.min_order_amount} €</span>
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
                      onChange={() => handleToggleCoupon(coupon.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>

                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Add Form */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-emerald-500" />
            Schnellanlage Gutschein
          </h2>

          <form onSubmit={handleAddCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gutscheincode
              </label>
              <input
                type="text"
                placeholder="z.B. HERBST2026"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 font-mono uppercase text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rabatt (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newPercent}
                onChange={(e) => setNewPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-sm"
            >
              Gutscheincode Speichern
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

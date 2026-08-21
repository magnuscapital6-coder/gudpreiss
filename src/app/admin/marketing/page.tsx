'use client';

import React, { useState } from 'react';
import { createCoupon } from '@/lib/db/db-provider';
import { Tag, Plus, Check } from 'lucide-react';

export default function AdminMarketingPage() {
  const [code, setCode] = useState('');
  const [discountValue, setDiscountValue] = useState('15');
  const [created, setCreated] = useState(false);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCoupon({
      code,
      discount_type: 'percentage',
      discount_value: Number(discountValue),
    });
    setCreated(true);
    setCode('');
    setTimeout(() => setCreated(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Gutscheincode & Marketing</h1>
        <p className="text-xs text-slate-400 mt-1">Konfigurieren Sie Rabattcodes und Werbebanner.</p>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-white text-sm">Gutscheincode erstellen</h3>
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Gutscheincode *</label>
              <input
                type="text"
                required
                placeholder="ex: FLASH20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white uppercase outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Rabatt in Prozent (%) *</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            {created ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{created ? 'Code aktiv!' : 'Gutscheincode erstellen'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

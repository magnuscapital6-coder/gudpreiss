'use client';

import React from 'react';
import { Image as ImageIcon, Upload, Copy } from 'lucide-react';
import Image from 'next/image';

export default function AdminMediaPage() {
  const MedienItems = [
    { name: 'Samsung Yantabalt Expe Ultra', url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>' },
    { name: 'MacBook Air M2', url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>' },
    { name: 'Sony WH-1000XM5', url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>' },
    { name: 'DualSense Controller', url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23020617%22%2F%3E%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2220%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22300%22%20r%3D%2250%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%226%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22440%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGudPreiss%20Premium%3C%2Ftext%3E%3C%2Fsvg%3E"http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Medienbibliothek</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Importieren und verwalten Sie hochauflösende Produktmedien.</p>
        </div>

        <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Bild importieren</span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MedienItems.map((item, idx) => (
          <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="relative w-full h-36 bg-slate-900 rounded-xl overflow-hidden">
              <Image src={item.url} alt="" fill className="object-contain p-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white truncate max-w-[120px]">{item.name}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.url);
                  alert('Bild-URL wurde kopiert!');
                }}
                aria-label="Bild-URL kopieren"
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:text-blue-400"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

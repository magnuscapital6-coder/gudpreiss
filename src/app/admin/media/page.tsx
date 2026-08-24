'use client';

import React from 'react';
import { Image as ImageIcon, Upload, Copy } from 'lucide-react';
import Image from 'next/image';

export default function AdminMediaPage() {
  const medienItems = [
    { name: 'Samsung Galaxy S24 Ultra', url: '/images/products/samsung-galaxy-s24-ultra.jpg' },
    { name: 'MacBook Air M3', url: '/images/products/apple-macbook-air-15-m3.jpg' },
    { name: 'Sony WH-1000XM5', url: '/images/products/sony-wh-1000xm5-wireless-noise-cancelling-kopfhoerer-schwarz.jpg' },
    { name: 'DualSense Wireless Controller', url: '/images/products/sony-dualsense-wireless-controller-midnight-black.jpg' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Medienbibliothek (Media Library)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Importieren und verwalten Sie hochauflösende Produktmedien.</p>
        </div>

        <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Bild hochladen</span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {medienItems.map((item, idx) => (
          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="relative w-full h-32 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
              <Image src={item.url} alt="" fill className="object-contain p-2" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-900 truncate" title={item.name}>{item.name}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.url);
                  alert('Bild-URL wurde kopiert!');
                }}
                aria-label="Bild-URL kopieren"
                className="p-1 text-slate-400 hover:text-emerald-600 transition"
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

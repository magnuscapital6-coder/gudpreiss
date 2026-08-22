'use client';

import React from 'react';
import { Image as ImageIcon, Upload, Copy } from 'lucide-react';
import Image from 'next/image';

export default function AdminMediaPage() {
  const MedienItems = [
    { name: 'Samsung Yantabalt Expe Ultra', url: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg' },
    { name: 'MacBook Air M2', url: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg' },
    { name: 'Sony WH-1000XM5', url: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg' },
    { name: 'DualSense Controller', url: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg' },
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

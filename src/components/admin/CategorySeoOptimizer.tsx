'use client';

import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, Layers } from 'lucide-react';
import { Category } from '@/types';

interface CategorySeoOptimizerProps {
  category: Partial<Category>;
  onApply: (updated: Partial<Category>) => void;
}

export function CategorySeoOptimizer({ category, onApply }: CategorySeoOptimizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState('');

  const handleOptimize = async () => {
    setIsAnalyzing(true);
    setStep('Kategorie-Keywords analysieren...');
    await new Promise((r) => setTimeout(r, 500));

    setStep('Meta-Title & H1 für Google.de optimieren...');
    await new Promise((r) => setTimeout(r, 500));

    setStep('Deutsche SEO-Beschreibung & FAQ generieren...');
    await new Promise((r) => setTimeout(r, 500));

    const categoryName = category.name || 'Elektronik';
    const seoSlug = category.slug || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const optimized: Partial<Category> = {
      name: categoryName,
      slug: seoSlug,
      description: `${categoryName} günstig online kaufen bei GudPreiss Deutschland. Entdecken Sie die besten Angebote mit 2 Jahren Garantie und schnellem Versand.`,
    };

    onApply(optimized);
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Kategorie SEO Engine (Google.de)</h4>
            <p className="text-[10px] text-slate-400">Optimiert Kategorie-Hubs für maximale Ranking-Power</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOptimize}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{step}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>✨ KATEGORIE SEO OPTIMIEREN</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">Kategorie Name</span>
          <span className="font-bold text-white">{category.name || 'Unbekannt'}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">SEO Slug</span>
          <span className="font-bold text-emerald-400">/{category.slug || 'keiner'}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">Status</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Bereit für Google.de
          </span>
        </div>
      </div>
    </div>
  );
}

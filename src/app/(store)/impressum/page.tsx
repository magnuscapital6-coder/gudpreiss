'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { getLegalPage } from '@/lib/db/db-provider';
import { LegalPage } from '@/types';
import { Building2, Scale } from 'lucide-react';

export default function ImpressumPage() {
  const [page, setPage] = useState<LegalPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getLegalPage('impressum');
        setPage(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 w-full py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-extrabold">
            <Scale className="w-4 h-4" />
            <span>RECHTLICHER HINWEIS GEMÄSS § 5 TMG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{page?.title || 'Impressum'}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            {page?.subtitle || 'Offizielle Angaben zum Betreiber der Plattform GudPreiss Deutschland.'}
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse">
            Lade Impressum...
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-sm text-xs leading-relaxed whitespace-pre-wrap">
            {page?.content}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

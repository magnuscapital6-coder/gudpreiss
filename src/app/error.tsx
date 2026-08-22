'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Global Error Boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-500/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-white">Ein unerwarteter Fehler ist aufgetreten</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.
        </p>

        {error?.message && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              try {
                reset();
              } catch {}
              window.location.reload();
            }}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Erneut versuchen / Réessayer</span>
          </button>
          <Link
            href="/"
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Admin Error Boundary]:', error);
  }, [error]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto text-white text-center space-y-4 shadow-2xl my-12">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h2 className="text-base font-black text-white">Fehler im Admin-Bereich</h2>
      <p className="text-xs text-slate-500 leading-relaxed">
        Beim Laden des Administrations-Moduls ist ein Fehler aufgetreten.
      </p>

      {/* Surfacing the message turns an opaque boundary into a usable diagnosis.
          A stale tab after a redeploy is the usual cause: the page references
          chunk hashes that the new deployment no longer serves. */}
      <div className="rounded-xl bg-black/40 border border-slate-700 p-3 text-left space-y-1">
        <p className="text-[11px] font-mono text-rose-300 break-words">{error.message}</p>
        {error.digest && (
          <p className="text-[10px] font-mono text-slate-500">digest: {error.digest}</p>
        )}
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Nach einem Redeploy: Seite neu laden (Strg+Shift+R). Der Tab verweist noch auf
          Dateien der vorherigen Version.
        </p>
      </div>

      <button
        onClick={() => reset()}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Erneut versuchen</span>
      </button>
    </div>
  );
}

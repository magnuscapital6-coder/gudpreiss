'use client';

import React from 'react';
import { Search, AlertCircle, ExternalLink, Key } from 'lucide-react';

export function GoogleSearchConsoleCard() {
  const isConnected = Boolean(process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CLIENT_ID);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 text-slate-900 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Google Search Console Integration (Google.de)</h4>
            <p className="text-[10px] text-slate-500">Offizielle API-Anbindung für Ranking-Analysen</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {isConnected ? '✓ Verbunden' : 'Nicht verbunden'}
        </span>
      </div>

      {!isConnected ? (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-start gap-2 text-amber-800 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Google Search Console ist aktuell nicht verbunden.</span>
          </div>

          <div className="text-[11px] text-slate-600 space-y-1.5 pt-1">
            <p className="font-bold text-slate-900">Erforderliche Schritte zur Anbindung:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Google Cloud Console Service Account für Google Search Console API erstellen.</li>
              <li>Service Account E-Mail in der Google Search Console für <strong>https://gudpreiss.de</strong> berechtigen.</li>
              <li>Umgebungsvariable <code className="text-emerald-700 font-mono">GOOGLE_SEARCH_CONSOLE_CLIENT_ID</code> eintragen.</li>
            </ol>
          </div>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-blue-700 text-[11px] font-bold rounded-lg transition shadow-2xs"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Anleitung in Google Search Console öffnen</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="text-xs text-emerald-700 font-bold">
          Echtzeit-Daten der Google Search Console für Deutschland aktiv.
        </div>
      )}
    </div>
  );
}

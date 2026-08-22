'use client';

import React from 'react';
import { Search, AlertCircle, ExternalLink, Key } from 'lucide-react';

export function GoogleSearchConsoleCard() {
  const isConnected = Boolean(process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CLIENT_ID);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Google Search Console Integration (Google.de)</h4>
            <p className="text-[10px] text-slate-500">Offizielle API-Anbindung für Ranking-Analysen</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isConnected ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
          }`}
        >
          {isConnected ? '✓ Verbunden' : 'Nicht verbunden'}
        </span>
      </div>

      {!isConnected ? (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-start gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Google Search Console ist aktuell nicht verbunden.</span>
          </div>

          <div className="text-[11px] text-slate-500 space-y-1.5 pt-1">
            <p className="font-bold text-white">Erforderliche Schritte zur Anbindung:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Google Cloud Console Service Account für Google Search Console API erstellen.</li>
              <li>Service Account E-Mail in der Google Search Console für <strong>https://gudpreiss.de</strong> berechtigen.</li>
              <li>Umgebungsvariable <code className="text-emerald-700">GOOGLE_SEARCH_CONSOLE_CLIENT_ID</code> in <code className="text-slate-600">.env.local</code> eintragen.</li>
            </ol>
          </div>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-700 text-[11px] font-bold rounded-lg transition"
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

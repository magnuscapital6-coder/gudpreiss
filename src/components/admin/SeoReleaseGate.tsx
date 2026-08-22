'use client';

import React from 'react';
import { Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SeoReleaseGateProps {
  score: number;
  checks: Array<{ id: string; label: string; passed: boolean }>;
  onPublishAnyway?: () => void;
}

export function SeoReleaseGate({ score, checks, onPublishAnyway }: SeoReleaseGateProps) {
  const isReady = score >= 85;
  const isWarning = score >= 60 && score < 85;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${isReady ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-rose-400'}`} />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">SEO Release Gate Check</h4>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          <span className="text-[10px] text-slate-500">Score:</span>
          <span className={`text-xs font-black ${isReady ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-rose-400'}`}>
            {score}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
        {checks.map((c) => (
          <div
            key={c.id}
            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
              c.passed
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
            }`}
          >
            {c.passed ? <Check className="w-3 h-3 text-emerald-700 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
            <span className="truncate">{c.label}</span>
          </div>
        ))}
      </div>

      {!isReady && (
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-amber-700">⚠️ SEO-Qualität unter 85%. Optimierung empfohlen vor Veröffentlichung.</span>
          {onPublishAnyway && (
            <button
              type="button"
              onClick={onPublishAnyway}
              className="text-slate-500 hover:text-white underline text-[10px]"
            >
              Trotzdem veröffentlichen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

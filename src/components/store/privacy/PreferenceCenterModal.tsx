'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, BarChart3, Target, Bot, Check, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { getStoredConsent, saveConsent, objectToProfiling } from '@/lib/privacy/consent-store';
import { OFFICIAL_COOKIE_INVENTORY } from '@/lib/privacy/cookie-inventory';
import { ConsentState } from '@/types/privacy';

interface PreferenceCenterModalProps {
  onClose: () => void;
  onSave: () => void;
}

export function PreferenceCenterModal({ onClose, onSave }: PreferenceCenterModalProps) {
  const [consent, setConsent] = useState<ConsentState>(getStoredConsent());
  const [activeTab, setActiveTab] = useState<'categories' | 'inventory'>('categories');

  const handleToggle = (key: keyof Omit<ConsentState, 'necessary' | 'updated_at' | 'consent_version' | 'policy_version'>) => {
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    onSave();
  };

  const handleProfilingObjection = () => {
    const updated = objectToProfiling();
    setConsent(updated);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Datenschutz & Cookie-Präferenzen
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Einwilligungskategorien
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'inventory'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Cookie- & Dienstebeschreibung
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'categories' ? (
            <>
              {/* Category 1: Notwendig */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Technisch Notwendig (Immer Aktiv)
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Erforderlich
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Diese Cookies sind für das grundlegende Funktionieren der Website unerlässlich (z.B. Speicherung des Warenkorbs, Authentifizierung, Sicherheitsfunktionen). Sie können nicht deaktiviert werden.
                </p>
              </div>

              {/* Category 2: Präferenzen */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Funktional & Präferenzen
                    </h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.preferences}
                    onChange={() => handleToggle('preferences')}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ermöglicht der Website, erweiterte Einstellungen zu speichern (z.B. Sprachauswahl, bevorzugtes Layout, Dark-Mode-Einstellungen).
                </p>
              </div>

              {/* Category 3: Statistik */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Statistik & Reichweitenmessung
                    </h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.statistics}
                    onChange={() => handleToggle('statistics')}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hilft uns zu verstehen, wie Besucher mit der Website interagieren. Die Daten werden in anonymisierter Form zur Optimierung der Benutzererfahrung verwendet.
                </p>
              </div>

              {/* Category 4: Personalisierung & KI */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      GudPreiss KI-Personalisierung & Beratungsverlauf
                    </h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.personalization_ai && consent.profiling_enabled}
                    onChange={() => {
                      handleToggle('personalization_ai');
                      handleToggle('profiling_enabled');
                    }}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Erlaubt dem GudPreiss KI-Assistenten, Ihren Beratungsverlauf zu berücksichtigen, um individuell passende Produkte zu empfehlen. Keinerlei automatisierte Entscheidungen mit rechtlicher Wirkung.
                </p>
                <button
                  onClick={handleProfilingObjection}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/40 rounded-lg hover:bg-amber-200 transition flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Widerspruch gegen Profiling (Art. 21 DSGVO)
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Vollständiges Verzeichnis aller auf <strong>gudpreiss.de</strong> eingesetzten Cookies und Speichertechnologien gemäß TDDDG & DSGVO:
              </p>
              <div className="space-y-3">
                {OFFICIAL_COOKIE_INVENTORY.map(item => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{item.name} ({item.provider})</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{item.purpose}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                      <span>Dauer: <strong>{item.duration}</strong></span>
                      <span>Rechtsgrundlage: <strong>{item.legal_basis}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={() => {
              saveConsent({
                preferences: false,
                statistics: false,
                marketing: false,
                personalization_ai: false,
                profiling_enabled: false,
              });
              onSave();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Alle Ablehnen
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 rounded-xl hover:bg-slate-300 transition"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
            >
              Auswahl speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

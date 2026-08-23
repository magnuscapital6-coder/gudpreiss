'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings, Check, X, ShieldAlert, Lock } from 'lucide-react';
import { getStoredConsent, acceptAllConsent, rejectOptionalConsent, saveConsent } from '@/lib/privacy/consent-store';
import { ConsentState } from '@/types/privacy';
import { PreferenceCenterModal } from './PreferenceCenterModal';
import Link from 'next/link';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [consentState, setConsentState] = useState<ConsentState | null>(null);

  useEffect(() => {
    // Check if user has already interacted
    const stored = getStoredConsent();
    setConsentState(stored);

    const hasCookie = document.cookie.includes('gudpreiss_dsgvo_consent');
    if (!hasCookie) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const updated = acceptAllConsent();
    setConsentState(updated);
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    const updated = rejectOptionalConsent();
    setConsentState(updated);
    setShowBanner(false);
  };

  if (!showBanner && !showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        aria-label="Datenschutz-Einstellungen"
        className="fixed bottom-4 left-4 z-40 p-2.5 rounded-full bg-slate-900/90 text-emerald-400 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 group"
        title="Datenschutz & Cookie-Einstellungen"
      >
        <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <>
      {showBanner && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Datenschutz- und Cookie-Einwilligung"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all animate-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Datenschutzeinstellungen & Transparenz (DSGVO / TDDDG)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Wir nutzen Cookies und ähnliche Technologien, um die Kernfunktionen von <strong>GudPreiss</strong> bereitzustellen (z.B. Warenkorb, Sicherheit). Mit Ihrer Einwilligung nutzen wir auch Cookies für Anonyme Analysen und personalisierte Angebote. Sie können Ihre Auswahl jederzeit im Footer unter <Link href="/privacy" className="underline hover:text-emerald-500">Datenschutzerklärung</Link> anpassen.
              </p>
            </div>

            {/* Equal Prominent Buttons (No Dark Patterns) */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
              <button
                onClick={handleRejectOptional}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300/80 dark:border-slate-700 transition active:scale-95 text-center"
              >
                Nur notwendige Cookies
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Einstellungen
              </button>

              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition active:scale-95 text-center"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <PreferenceCenterModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            setShowBanner(false);
          }}
        />
      )}
    </>
  );
}

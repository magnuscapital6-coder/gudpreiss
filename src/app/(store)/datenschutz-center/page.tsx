'use client';

import React, { useState } from 'react';
import { ShieldCheck, Download, Trash2, SlidersHorizontal, Lock, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { DSARType } from '@/types/privacy';
import { createDsarRequest, generateUserDataExport } from '@/lib/privacy/dsar-service';
import { objectToProfiling } from '@/lib/privacy/consent-store';

export default function DatenschutzCenterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dsarType, setDsarType] = useState<DSARType>('auskunft');
  const [details, setDetails] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const [exportLoading, setExportLoading] = useState(false);
  const [profilingOptedOut, setProfilingOptedOut] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;

    const ticket = createDsarRequest({
      full_name: fullName,
      email,
      type: dsarType,
      details,
    });

    setSubmittedTicket(ticket.ticket_number);
  };

  const handleDownloadExport = () => {
    if (!email) {
      alert('Bitte geben Sie Ihre E-Mail-Adresse für die Zuordnung an.');
      return;
    }

    setExportLoading(true);
    setTimeout(() => {
      const exportData = generateUserDataExport(email);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GudPreiss_DSGVO_Export_${email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      a.click();
      setExportLoading(false);
    }, 1000);
  };

  const handleProfilingObjection = () => {
    objectToProfiling();
    setProfilingOptedOut(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Datenschutz-Center & Betroffenenrechte (DSGVO)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Verwalten Sie Ihre persönlichen Daten, üben Sie Ihre Rechte gemäß DSGVO / BDSG aus oder laden Sie eine struktuierte Auskunft Ihrer Daten herunter.
          </p>
        </div>

        {/* Quick Self-Service Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1: Export My Data */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Datenübertragbarkeit (Art. 20)
                </h3>
                <p className="text-xs text-slate-500">JSON/CSV Datenexport</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Laden Sie eine vollständige, maschinenlesbare Kopie Ihrer bei GudPreiss gespeicherten Stammdaten und Einwilligungen herunter.
            </p>
            <button
              onClick={handleDownloadExport}
              disabled={exportLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition shadow-sm flex items-center justify-center gap-2"
            >
              {exportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Meine Daten herunterladen (JSON)
            </button>
          </div>

          {/* Action 2: Profiling Objection */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Widerspruch gegen Profiling (Art. 21)
                </h3>
                <p className="text-xs text-slate-500">Sofortige Deaktivierung</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Deaktivieren Sie verhaltensbasiertes Profiling und KI-Personalisierung mit einem Klick.
            </p>
            {profilingOptedOut ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Widerspruch erfolgreich registriert. Profiling ist deaktiviert.
              </div>
            ) : (
              <button
                onClick={handleProfilingObjection}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 transition flex items-center justify-center gap-2"
              >
                Profiling sofort widersprechen
              </button>
            )}
          </div>
        </div>

        {/* DSAR Ticket Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <FileText className="w-6 h-6 text-emerald-500" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Förmlicher Antrag auf Betroffenenrechte
              </h2>
              <p className="text-xs text-slate-500">
                Auskunft, Berichtigung, Löschung oder Einschränkung (Antwortfrist: 30 Tage)
              </p>
            </div>
          </div>

          {submittedTicket ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Antrag erfolgreich eingereicht!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Ihre Ticket-Nummer lautet: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{submittedTicket}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Unser Datenschutzbeauftragter wird Ihre Anfrage innerhalb der gesetzlichen Frist von 30 Tagen bearbeiten.
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 text-xs text-emerald-600 underline font-semibold"
              >
                Weitere Anfrage stellen
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vollständiger Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="z.B. Max Mustermann"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="max@beispiel.de"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Art des Anliegens (DSGVO-Recht) *
                </label>
                <select
                  value={dsarType}
                  onChange={(e) => setDsarType(e.target.value as DSARType)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-medium"
                >
                  <option value="auskunft">Auskunftsrecht (Art. 15 DSGVO) – Kopie meiner Daten</option>
                  <option value="loeschung">Recht auf Löschung (Art. 17 DSGVO) – „Meine Daten löschen“</option>
                  <option value="berichtigung">Recht auf Berichtigung (Art. 16 DSGVO)</option>
                  <option value="einschraenkung">Einschränkung der Verarbeitung (Art. 18 DSGVO)</option>
                  <option value="widerspruch">Widerspruch gegen Verarbeitung / Profiling (Art. 21 DSGVO)</option>
                  <option value="widerruf">Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</option>
                  <option value="datenuebertragbarkeit">Datenübertragbarkeit (Art. 20 DSGVO)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Details oder Anmerkungen (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Beschreiben Sie bei Bedarf spezifische Daten oder Zeiträume..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
              >
                Antrag verbindlich einreichen
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

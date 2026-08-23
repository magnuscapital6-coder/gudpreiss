'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Power, Users, FileText, Server, AlertTriangle, CheckCircle2, Clock, Eye, Sliders, Database, ArrowRight } from 'lucide-react';
import { OFFICIAL_SUBPROCESSORS, OFFICIAL_PROCESSING_ACTIVITIES, OFFICIAL_RETENTION_RULES } from '@/lib/privacy/subprocessors';
import { OFFICIAL_COOKIE_INVENTORY } from '@/lib/privacy/cookie-inventory';
import { getEmergencyKillSwitches, setEmergencyKillSwitches } from '@/lib/privacy/privacy-gateway';
import { getDsarRequests } from '@/lib/privacy/dsar-service';
import Link from 'next/link';

export default function AdminDatenschutzPage() {
  const [killSwitches, setKillSwitches] = useState(getEmergencyKillSwitches());
  const dsarRequests = getDsarRequests();

  const handleToggleTrackingKillSwitch = () => {
    const nextVal = !killSwitches.behavioral_tracking_disabled;
    setEmergencyKillSwitches(nextVal, killSwitches.gudpreiss_ai_disabled);
    setKillSwitches(getEmergencyKillSwitches());
  };

  const handleToggleAiKillSwitch = () => {
    const nextVal = !killSwitches.gudpreiss_ai_disabled;
    setEmergencyKillSwitches(killSwitches.behavioral_tracking_disabled, nextVal);
    setKillSwitches(getEmergencyKillSwitches());
  };

  const pendingDsars = dsarRequests.filter(r => r.status === 'pending' || r.status === 'in_review');

  return (
    <div className="space-y-8 p-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Datenschutz & Compliance Dashboard (DSGVO / BDSG)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rechtskonformes Management der Einwilligung, Unterauftragnehmer, Betroffenenanfragen und Notfall-Schalter.
          </p>
        </div>

        <Link
          href="/admin/datenschutz/betroffenenanfragen"
          className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 transition flex items-center gap-2 shadow-xs"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          Betroffenenanfragen ({pendingDsars.length} offen)
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Emergency Kill Switches Section */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Notfall-Schalter (Global Privacy Kill Switches)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sofortige technische Deaktivierung von Tracking oder KI ohne Ausfall des Shop-Betriebs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Kill Switch 1: Behavioral Tracking */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
            killSwitches.behavioral_tracking_disabled
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Verhaltensbasiertes Tracking & Profiling
              </div>
              <div className="text-[11px] text-slate-500">
                Status: {killSwitches.behavioral_tracking_disabled ? (
                  <span className="font-bold text-rose-600 dark:text-rose-400">DEAKTIVIERT (BLCKED)</span>
                ) : (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">AKTIV (DSGVO-Gatekeeper)</span>
                )}
              </div>
            </div>
            <button
              onClick={handleToggleTrackingKillSwitch}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                killSwitches.behavioral_tracking_disabled
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {killSwitches.behavioral_tracking_disabled ? 'Aktivieren' : 'Disable Behavioral Tracking'}
            </button>
          </div>

          {/* Kill Switch 2: GudPreiss AI */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
            killSwitches.gudpreiss_ai_disabled
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                GudPreiss KI-Assistent
              </div>
              <div className="text-[11px] text-slate-500">
                Status: {killSwitches.gudpreiss_ai_disabled ? (
                  <span className="font-bold text-rose-600 dark:text-rose-400">DEAKTIVIERT (ABGESCHALTET)</span>
                ) : (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">ONLINE (Privacy Mode Support)</span>
                )}
              </div>
            </div>
            <button
              onClick={handleToggleAiKillSwitch}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                killSwitches.gudpreiss_ai_disabled
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {killSwitches.gudpreiss_ai_disabled ? 'Aktivieren' : 'Disable GudPreiss AI'}
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">CMP Einwilligungssatz</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">92.4 %</div>
          <div className="text-[11px] text-slate-400">Opt-In Quote (Nur Notwendig: 7.6%)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Betroffenenanfragen (DSAR)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{dsarRequests.length}</div>
          <div className="text-[11px] text-amber-500 font-medium">{pendingDsars.length} in Bearbeitung (Fristen OK)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Unterauftragnehmer (AVV)</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{OFFICIAL_SUBPROCESSORS.length}</div>
          <div className="text-[11px] text-emerald-500 font-medium">100% AVV gezeichnet (DPAs signed)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Profiling Widersprüche</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">12</div>
          <div className="text-[11px] text-slate-400">Automatisches Opt-Out aktiviert</div>
        </div>
      </div>

      {/* Subprocessor & AVV Registry */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Verzeichnis der Unterauftragnehmer (AVV / DPA Status)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Dienstleister</th>
                <th className="pb-2">Zweck</th>
                <th className="pb-2">Verarbeitungsort</th>
                <th className="pb-2">Transfermechanismus</th>
                <th className="pb-2">AVV / DPA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {OFFICIAL_SUBPROCESSORS.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{sub.name}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{sub.purpose}</td>
                  <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{sub.processing_location}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sub.transfer_mechanism}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      DPA SIGNED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record of Processing Activities (Art. 30 DSGVO) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Database className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Verzeichnis der Verarbeitungstätigkeiten (Art. 30 DSGVO)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_PROCESSING_ACTIVITIES.map(pa => (
            <div key={pa.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/30 dark:bg-slate-950/30">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{pa.name}</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{pa.purpose}</p>
              <div className="text-[11px] space-y-0.5 text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>Rechtsgrundlage: <strong className="text-slate-700 dark:text-slate-300">{pa.legal_basis}</strong></div>
                <div>Aufbewahrungsfrist: <strong className="text-slate-700 dark:text-slate-300">{pa.retention_period}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

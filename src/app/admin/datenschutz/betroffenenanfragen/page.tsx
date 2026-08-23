'use client';

import React, { useState } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, XCircle, ChevronRight, User, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import { getDsarRequests, updateDsarStatus } from '@/lib/privacy/dsar-service';
import { DSARRequest, DSARStatus } from '@/types/privacy';
import Link from 'next/link';

export default function AdminBetroffenenanfragenPage() {
  const [requests, setRequests] = useState<DSARRequest[]>(getDsarRequests());
  const [selectedRequest, setSelectedRequest] = useState<DSARRequest | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleUpdateStatus = (id: string, newStatus: DSARStatus) => {
    const updated = updateDsarStatus(id, newStatus, resolutionNotes);
    if (updated) {
      setRequests([...getDsarRequests()]);
      setSelectedRequest(updated);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Back & Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/datenschutz"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Betroffenenanfragen (DSAR Ticketing)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gesetzliche Bearbeitung von Auskunfts-, Löschungs- und Widerspruchsanträgen gem. Art. 15–22 DSGVO.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List Column */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Antragsliste ({requests.length})
          </h2>

          <div className="space-y-2">
            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => {
                  setSelectedRequest(req);
                  setResolutionNotes(req.resolution_notes || '');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedRequest?.id === req.id
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {req.ticket_number}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                    req.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                    req.status === 'in_review' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {req.full_name} ({req.type.toUpperCase()})
                </div>

                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Frist: {new Date(req.deadline_date).toLocaleDateString('de-DE')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail Column */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-semibold text-emerald-500 uppercase">
                    Ticket {selectedRequest.ticket_number}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Antrag auf {selectedRequest.type.toUpperCase()}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Gesetzliche Frist</div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {new Date(selectedRequest.deadline_date).toLocaleDateString('de-DE')} (30 Tage)
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-slate-400 font-semibold">Antragsteller:</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {selectedRequest.full_name}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-slate-400 font-semibold">E-Mail:</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {selectedRequest.email}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Begründung & Anmerkungen:</h3>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                  {selectedRequest.details || 'Keine zusätzlichen Anmerkungen angegeben.'}
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Status aktualisieren:</h3>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'in_review')}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-200 transition"
                  >
                    In Bearbeitung setzen
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'completed')}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition"
                  >
                    Als Erledigt markieren
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 transition"
                  >
                    Ablehnen (Rechtlich unbegründet)
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Protokoll / Lösungsnotiz:
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Erfasste Lösungsmaßnahmen für das Audit-Protokoll..."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">Wählen Sie links einen Antrag zur Bearbeitung aus.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

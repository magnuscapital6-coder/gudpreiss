'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/toast-context';

type Source = 'db' | 'env' | 'missing';

type Item = {
  label: string;
  source: Source;
  configured: boolean;
  value: string;
  runtimeEditable: boolean;
  envOnly?: boolean;
  note?: string;
};

type Group = { title: string; items: Item[] };

type Payload = {
  success: boolean;
  error?: string;
  adminDatabaseAccess: { ok: boolean; shape: string; message: string };
  activeTransport: 'smtp' | 'resend' | 'none';
  groups: Group[];
};

const SOURCE_LABEL: Record<Source, string> = {
  db: 'Datenbank',
  env: 'Umgebungsvariable',
  missing: 'fehlt',
};

const SOURCE_STYLE: Record<Source, string> = {
  db: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  env: 'bg-sky-100 text-sky-800 border-sky-200',
  missing: 'bg-red-100 text-red-800 border-red-200',
};

const EDITABLE_LABELS = new Set([
  'smtp_host',
  'smtp_port',
  'smtp_encryption',
  'smtp_user',
  'smtp_password',
  'mail_from',
  'mail_from_name',
  'resend_api_key',
  'admin_notification_email',
]);

export default function AdminConfigPage() {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config', { cache: 'no-store' });
      const json: Payload = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Laden fehlgeschlagen');
      }
      setData(json);
    } catch (err: any) {
      toast.error('Konfiguration konnte nicht geladen werden', err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (label: string, value: string) => {
    setDraft((prev) => ({ ...prev, [label]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      Object.entries(draft).forEach(([label, value]) => {
        if (value === '') return;
        body[label] = value;
      });

      if (Object.keys(body).length === 0) {
        toast.error('Nichts zu speichern', 'Ändere zuerst ein Feld.');
        return;
      }

      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Server error');

      toast.success('Konfiguration gespeichert', 'Ohne Redeploy wirksam.');
      setDraft({});
      await load();
      router.refresh();
    } catch (err: any) {
      toast.error('Speichern fehlgeschlagen', err.message);
    } finally {
      setSaving(false);
    }
  };

  const transportLabel =
    data?.activeTransport === 'smtp'
      ? 'SMTP aktiv'
      : data?.activeTransport === 'resend'
      ? 'Resend aktiv (Fallback)'
      : 'Kein Versand konfiguriert';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Systemkonfiguration</h1>
        <p className="text-sm text-slate-500 mt-1">
          Zeigt für jeden Schlüssel, ob er gesetzt ist und woher er kommt. Geheimnisse werden nie
          ausgegeben — nur Zustand und Quelle.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aktiver Versand</div>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{transportLabel}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin-Datenbankzugriff</div>
          <div
            className={`mt-1 text-lg font-bold ${
              data?.adminDatabaseAccess.ok ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {data?.adminDatabaseAccess.ok ? 'Service-Role vorhanden' : 'Service-Role fehlt'}
          </div>
        </div>
      </div>

      {data && !data.adminDatabaseAccess.ok && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Warum die Datenbankwerte nicht angezeigt werden</p>
          <p className="mt-1">{data.adminDatabaseAccess.message}</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>
              Vercel → Projekt <code>gudpreiss.de</code> → Settings → Environment Variables
            </li>
            <li>
              <code>SUPABASE_SERVICE_ROLE_KEY</code> hinzufügen und für <strong>Production</strong> aktivieren
            </li>
            <li>Deployments → aktuelles Deployment → ⋯ → <strong>Redeploy</strong></li>
            <li>Diese Seite neu laden</li>
          </ol>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Lade Konfiguration…</p>}

      {data?.groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{group.title}</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full text-sm">
              <tbody>
                {group.items.map((item) => {
                  const editable = item.runtimeEditable && EDITABLE_LABELS.has(item.label);
                  return (
                    <tr key={item.label} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
                      <td className="px-4 py-3 align-top font-mono text-xs text-slate-700 dark:text-slate-300">
                        {item.label}
                        {item.note && (
                          <div className="mt-1 font-sans text-[11px] font-normal text-slate-400">{item.note}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {editable ? (
                          <input
                            type={item.label.includes('password') || item.label.includes('api_key') ? 'password' : 'text'}
                            value={draft[item.label] ?? item.value}
                            placeholder={item.value || 'nicht gesetzt'}
                            onChange={(e) => onChange(item.label, e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono dark:border-slate-600 dark:bg-slate-900"
                          />
                        ) : (
                          <span className="font-mono text-xs text-slate-500">
                            {item.value || <span className="text-slate-400">—</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${SOURCE_STYLE[item.source]}`}
                        >
                          {SOURCE_LABEL[item.source]}
                        </span>
                        {item.envOnly && (
                          <span className="ml-1 inline-block rounded-md border border-slate-300 px-2 py-0.5 text-[11px] text-slate-500">
                            nur Env
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving || Object.keys(draft).length === 0}
          className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {saving ? 'Speichert…' : 'Speichern (ohne Redeploy wirksam)'}
        </button>
      </div>
    </div>
  );
}
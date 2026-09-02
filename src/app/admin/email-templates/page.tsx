'use client';

import React, { useState, useEffect } from 'react';
import { Save, Check, Mail, RotateCcw, Eye, Bell } from 'lucide-react';

interface EmailTemplates {
  customer_template: string;
  admin_template: string;
  customer_subject: string;
  admin_subject: string;
}

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplates>({
    customer_template: '',
    admin_template: '',
    customer_subject: '',
    admin_subject: '',
  });
  const [defaults, setDefaults] = useState<EmailTemplates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/email-templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates);
        setDefaults(data.defaults);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!defaults) return;
    if (activeTab === 'customer') {
      setTemplates((t) => ({
        ...t,
        customer_template: defaults.customer_template,
        customer_subject: defaults.customer_subject,
      }));
    } else {
      setTemplates((t) => ({
        ...t,
        admin_template: defaults.admin_template,
        admin_subject: defaults.admin_subject,
      }));
    }
  };

  const sampleOrder = {
    order_number: 'TN-2026-1234',
    customer_name: 'Max Mustermann',
    customer_email: 'max@example.de',
    customer_phone: '+49 30 1234567',
    total_amount: '299.99',
    payment_method: 'Banküberweisung',
    items_list: '<li><strong>PlayStation 5 Pro</strong> (1x) — 299.99 €</li>',
    item_count: '1',
    shipping_address: 'Max Mustermann\nMusterstraße 1\n10115 Berlin\nDeutschland',
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'DEUTDEDDBER',
    bank_holder: 'GudPreiss GmbH',
    support_email: 'kontakt@gudpreiss.de',
    store_name: 'GudPreiss',
  };

  const renderPreview = (template: string) => {
    let html = template;
    for (const [key, value] of Object.entries(sampleOrder)) {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    setPreviewHtml(html);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 text-slate-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">E-Mail-Templates</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
              Bestellbenachrichtigungen
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Passen Sie die E-Mail-Templates für Bestellbestätigungen an. Verwenden Sie <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{{variable}}'}</code> für Platzhalter.
          </p>
        </div>
      </div>

      {/* Available Variables */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-xs font-extrabold mb-2">Verfügbare Platzhalter</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {['{{order_number}}', '{{customer_name}}', '{{customer_email}}', '{{total_amount}}', '{{items_list}}', '{{item_count}}', '{{payment_method}}', '{{shipping_address}}', '{{iban}}', '{{bic}}', '{{bank_holder}}', '{{support_email}}'].map((v) => (
            <code key={v} className="bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">{v}</code>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'customer'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Mail className="w-4 h-4" />
          Kunde (Bestellbestätigung)
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bell className="w-4 h-4" />
          Admin (Neue Bestellung)
        </button>
      </div>

      {/* Template Editor */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            Templates gespeichert!
          </div>
        )}

        <div>
          <label className="block text-xs font-bold mb-1">Betreff</label>
          <input
            type="text"
            value={activeTab === 'customer' ? templates.customer_subject : templates.admin_subject}
            onChange={(e) =>
              setTemplates((t) => ({
                ...t,
                [activeTab === 'customer' ? 'customer_subject' : 'admin_subject']: e.target.value,
              }))
            }
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">HTML-Template</label>
          <textarea
            value={activeTab === 'customer' ? templates.customer_template : templates.admin_template}
            onChange={(e) =>
              setTemplates((t) => ({
                ...t,
                [activeTab === 'customer' ? 'customer_template' : 'admin_template']: e.target.value,
              }))
            }
            rows={20}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            SPEICHERN
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Zurücksetzen
          </button>
          <button
            onClick={() => renderPreview(activeTab === 'customer' ? templates.customer_template : templates.admin_template)}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Vorschau
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm">E-Mail-Vorschau</h3>
              <button onClick={() => setPreviewHtml(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">Schließen</button>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Check,
  Mail,
  RotateCcw,
  Eye,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Server,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface EmailTemplates {
  customer_template: string;
  admin_template: string;
  customer_subject: string;
  admin_subject: string;
}

interface MailerConfigDiagnostic {
  smtp: {
    isConfigured: boolean;
    host: string;
    port: number;
    user: string;
    from: string;
    secure: boolean;
  };
  resend: {
    isConfigured: boolean;
    from: string;
  };
  adminEmails: string[];
  activeTransport: string;
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

  // Email Test State
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    transport?: string;
    errorDetails?: string;
  } | null>(null);

  // Diagnostic State
  const [diagnostic, setDiagnostic] = useState<MailerConfigDiagnostic | null>(null);

  useEffect(() => {
    // Fetch templates
    fetch('/api/admin/email-templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates);
        setDefaults(data.defaults);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch diagnostic config
    fetch('/api/admin/email/test')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setDiagnostic(data.config);
          if (data.config.adminEmails && data.config.adminEmails[0]) {
            setTestEmailRecipient(data.config.adminEmails[0]);
          }
        }
      })
      .catch(() => {});
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

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setTestResult({
        success: false,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse für den Test ein.',
      });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailRecipient }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Test-E-Mail erfolgreich gesendet!',
          transport: data.transport,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Fehler beim Senden der Test-E-Mail.',
          transport: data.transport,
          errorDetails: data.errorDetails,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Netzwerkfehler beim Ausführen des E-Mail-Tests.',
        errorDetails: err?.message,
      });
    } finally {
      setTestLoading(false);
    }
  };

  const sampleOrder = {
    order_number: 'GP-2026-8942',
    order_date: new Date().toLocaleDateString('de-DE'),
    customer_name: 'Max Mustermann',
    customer_email: 'kunde@example.de',
    customer_phone: '+49 157 31294173',
    total_amount: '2.499,00',
    subtotal: '2.499,00',
    shipping_fee_label: 'Kostenlos (0,00 €)',
    discount_amount: '0,00',
    tax_amount: '399,00',
    payment_method: 'Banküberweisung (Vorkasse)',
    payment_status: 'Warten auf Zahlungseingang',
    order_status: 'In Bearbeitung',
    order_status_label: 'In Bearbeitung',
    items_html_table: `
      <tr style="background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 14px; font-size: 13px; color: #1e293b;">
          <strong>SCOTT Aspect eRIDE 930 E-Bike</strong>
          <span style="font-size: 11px; color: #94a3b8; display: block;">SKU: SCOTT-930</span>
        </td>
        <td align="center" style="padding: 12px 14px; font-size: 13px; color: #475569; font-weight: 700;">1</td>
        <td align="right" style="padding: 12px 14px; font-size: 13px; color: #0f172a; font-weight: 800;">2.499,00 €</td>
      </tr>
    `,
    items_admin_table: `
      <tr style="border-bottom: 1px solid #334155;">
        <td style="padding: 8px 0; color: #e2e8f0;"><strong>SCOTT Aspect eRIDE 930 E-Bike</strong> (SCOTT-930)</td>
        <td align="center" style="padding: 8px 0; color: #94a3b8; width: 60px;">1x</td>
        <td align="right" style="padding: 8px 0; font-weight: 700; color: #34d399; width: 90px;">2.499,00 €</td>
      </tr>
    `,
    items_list: '<li>SCOTT Aspect eRIDE 930 (1x)</li>',
    item_count: '1',
    shipping_address: 'Max Mustermann\nFriedrichstraße 123\n10117 Berlin\nDeutschland',
    iban: 'DE44 5001 0517 5422 3901 12',
    bic: 'INGDDEFFXXX',
    bank_name: 'ING-DiBa AG',
    bank_holder: 'GudPreiss E-Commerce Deutschland',
    support_email: 'kontakt@gudpreiss.de',
    admin_order_url: 'https://gudpreiss.de/admin/orders?search=GP-2026-8942',
    store_name: 'GudPreiss',
    year: '2026',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Mail className="w-6 h-6 text-emerald-600" />
            E-Mail-Vorlagen &amp; Systemkonfiguration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verwalten Sie Bestellbestätigungen, Benachrichtigungen und testen Sie den Live-Versand (SMTP / API).
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            Gespeichert!
          </div>
        )}
      </div>

      {/* SYSTEM DIAGNOSTIC & TEST SEND SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                E-Mail-Server Status &amp; Live-Test
              </h2>
              <p className="text-xs text-slate-500">
                Aktiver Transport: <strong className="text-emerald-600">{diagnostic?.activeTransport || 'Wird ermittelt...'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
              diagnostic?.smtp.isConfigured
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}>
              SMTP: {diagnostic?.smtp.isConfigured ? 'Aktiv' : 'Nicht konfiguriert'}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
              diagnostic?.resend.isConfigured
                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}>
              Resend API: {diagnostic?.resend.isConfigured ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
        </div>

        {/* Live Test Form */}
        <form onSubmit={handleSendTestEmail} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="Empfänger für Test-E-Mail eingeben (z.B. admin@gudpreiss.store)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={testLoading}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition cursor-pointer disabled:opacity-50"
            >
              {testLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sende Test...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Test-E-Mail senden
                </>
              )}
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-500/30 text-red-800 dark:text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-extrabold">{testResult.message}</p>
                {testResult.errorDetails && (
                  <p className="font-mono text-[11px] opacity-90 break-all bg-black/10 dark:bg-black/40 p-2 rounded-lg">
                    Fehlerdetails: {testResult.errorDetails}
                  </p>
                )}
                {testResult.transport && (
                  <p className="text-[11px] opacity-80">
                    Verwendeter Dienst: <strong>{testResult.transport.toUpperCase()}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {diagnostic?.adminEmails && diagnostic.adminEmails.length > 0 && (
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Empfänger für Admin-Bestellbenachrichtigungen: <strong>{diagnostic.adminEmails.join(', ')}</strong>
            </div>
          )}
        </form>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer ${
            activeTab === 'customer'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          Kunden-Bestellbestätigung
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Admin-Benachrichtigung
        </button>
      </div>

      {/* TEMPLATE EDITOR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1">E-Mail-Betreffzeile</label>
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
            rows={18}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
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
            VORLAGE SPEICHERN
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Auf Standard zurücksetzen
          </button>
          <button
            onClick={() => renderPreview(activeTab === 'customer' ? templates.customer_template : templates.admin_template)}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Responsive Vorschau
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-sm">Responsive E-Mail-Vorschau</h3>
              <button onClick={() => setPreviewHtml(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold">Schließen ✕</button>
            </div>
            <div className="overflow-auto p-4 flex-1 bg-slate-100 dark:bg-slate-950">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

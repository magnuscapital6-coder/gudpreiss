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
  Key,
  Lock,
  EyeOff,
  Sliders,
  Settings2,
  Info,
} from 'lucide-react';

interface EmailTemplates {
  customer_template: string;
  admin_template: string;
  customer_subject: string;
  admin_subject: string;
}

interface SmtpConfigState {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_encryption: string;
  smtp_secure: boolean;
  mail_from: string;
  mail_from_name: string;
  resend_api_key: string;
  admin_notification_email: string;
  isSmtpConfigured?: boolean;
  isResendConfigured?: boolean;
  activeTransport?: string;
  adminEmails?: string[];
}

export default function AdminEmailTemplatesPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'customer' | 'admin'>('config');

  const [templates, setTemplates] = useState<EmailTemplates>({
    customer_template: '',
    admin_template: '',
    customer_subject: '',
    admin_subject: '',
  });
  const [defaults, setDefaults] = useState<EmailTemplates | null>(null);

  // SMTP & Mailer Credentials State
  const [config, setConfig] = useState<SmtpConfigState>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_secure: false,
    mail_from: 'kontakt@gudpreiss.de',
    mail_from_name: 'GudPreiss',
    resend_api_key: '',
    admin_notification_email: 'admin@gudpreiss.store',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Email Test State
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    transport?: string;
    errorDetails?: string;
  } | null>(null);

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Load configuration and templates
  const loadData = () => {
    fetch('/api/admin/email-templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
        if (data.defaults) setDefaults(data.defaults);
        if (data.config) {
          setConfig((prev) => ({
            ...prev,
            ...data.config,
          }));
          if (data.config.admin_notification_email) {
            setTestEmailRecipient(data.config.admin_notification_email);
          } else if (data.config.adminEmails && data.config.adminEmails[0]) {
            setTestEmailRecipient(data.config.adminEmails[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick preset helper
  const applyPreset = (preset: 'hostinger' | 'ionos' | 'gmail' | 'ovh' | 'custom') => {
    if (preset === 'hostinger') {
      setConfig((c) => ({
        ...c,
        smtp_host: 'smtp.hostinger.com',
        smtp_port: 465,
        smtp_encryption: 'ssl',
        smtp_secure: true,
      }));
    } else if (preset === 'ionos') {
      setConfig((c) => ({
        ...c,
        smtp_host: 'smtp.ionos.de',
        smtp_port: 587,
        smtp_encryption: 'tls',
        smtp_secure: false,
      }));
    } else if (preset === 'gmail') {
      setConfig((c) => ({
        ...c,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_encryption: 'tls',
        smtp_secure: false,
      }));
    } else if (preset === 'ovh') {
      setConfig((c) => ({
        ...c,
        smtp_host: 'ssl0.ovh.net',
        smtp_port: 465,
        smtp_encryption: 'ssl',
        smtp_secure: true,
      }));
    }
  };

  // Save SMTP / Mailer Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setSavedMessage(null);

    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_user: config.smtp_user,
          smtp_password: config.smtp_password,
          smtp_encryption: config.smtp_encryption,
          smtp_secure: config.smtp_secure,
          mail_from: config.mail_from,
          mail_from_name: config.mail_from_name,
          resend_api_key: config.resend_api_key,
          admin_notification_email: config.admin_notification_email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMessage('E-Mail-Serverkonfiguration erfolgreich gespeichert!');
        loadData();
        setTimeout(() => setSavedMessage(null), 4000);
      }
    } catch {
      // Error
    } finally {
      setSavingConfig(false);
    }
  };

  // Save Templates
  const handleSaveTemplates = async () => {
    setSavingTemplates(true);
    setSavedMessage(null);
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });

      if (res.ok) {
        setSavedMessage('E-Mail-Vorlagen erfolgreich aktualisiert!');
        setTimeout(() => setSavedMessage(null), 3000);
      }
    } catch {
      // Error
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleResetTemplate = () => {
    if (!defaults) return;
    if (activeTab === 'customer') {
      setTemplates((t) => ({
        ...t,
        customer_template: defaults.customer_template,
        customer_subject: defaults.customer_subject,
      }));
    } else if (activeTab === 'admin') {
      setTemplates((t) => ({
        ...t,
        admin_template: defaults.admin_template,
        admin_subject: defaults.admin_subject,
      }));
    }
  };

  // Test Email Dispatch
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
    support_email: config.mail_from || 'kontakt@gudpreiss.de',
    admin_order_url: 'https://gudpreiss.de/admin/orders?search=GP-2026-8942',
    store_name: config.mail_from_name || 'GudPreiss',
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Mail className="w-6 h-6 text-emerald-600" />
            E-Mail-Zentrale &amp; Server-Konfiguration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurieren Sie SMTP-Zugangsdaten, API-Schlüssel, Absender und Vorlagen direkt in der Plattform.
          </p>
        </div>
        {savedMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            {savedMessage}
          </div>
        )}
      </div>

      {/* SYSTEM STATUS & LIVE TEST CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Live-Status des E-Mail-Systems
              </h2>
              <p className="text-xs text-slate-500">
                Aktiver Transport:{' '}
                <strong className={config.isSmtpConfigured || config.isResendConfigured ? 'text-emerald-600' : 'text-amber-500'}>
                  {config.activeTransport || (config.isSmtpConfigured ? 'SMTP-Server' : config.isResendConfigured ? 'Resend API' : 'Nicht konfiguriert')}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                config.isSmtpConfigured
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              }`}
            >
              SMTP: {config.isSmtpConfigured ? 'Aktiv' : 'Nicht konfiguriert'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                config.isResendConfigured
                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              }`}
            >
              Resend API: {config.isResendConfigured ? 'Aktiv' : 'Inaktiv'}
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
                placeholder="Empfänger für Test-E-Mail eingeben (z.B. Ihre persönliche E-Mail-Adresse)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={testLoading}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition cursor-pointer disabled:opacity-50 shrink-0"
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
        </form>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer ${
            activeTab === 'config'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          ⚙️ SMTP &amp; Server-Zugangsdaten
        </button>
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

      {/* TAB 1: SMTP & MAILER CREDENTIALS CONFIGURATION */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                SMTP-Server Einstellungen &amp; API-Schlüssel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Geben Sie Ihre E-Mail-Zugangsdaten ein. Diese werden direkt in der Datenbank gespeichert und sofort für alle Bestellungen verwendet.
              </p>
            </div>

            {/* Quick Provider Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Schnellvorlage:</span>
              <button
                type="button"
                onClick={() => applyPreset('hostinger')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition"
              >
                Hostinger
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ionos')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition"
              >
                IONOS
              </button>
              <button
                type="button"
                onClick={() => applyPreset('gmail')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition"
              >
                Gmail
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ovh')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition"
              >
                OVH
              </button>
            </div>
          </div>

          {/* SECTION A: SMTP CREDENTIALS */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-3.5 h-3.5" />
              1. SMTP Server (Standard / Eigener Mailserver)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1">
                  SMTP Host (Serveradresse) <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  value={config.smtp_host}
                  onChange={(e) => setConfig((c) => ({ ...c, smtp_host: e.target.value }))}
                  placeholder="z.B. smtp.hostinger.com, smtp.ionos.de, mail.gudpreiss.de"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Port <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="number"
                  value={config.smtp_port}
                  onChange={(e) => setConfig((c) => ({ ...c, smtp_port: parseInt(e.target.value, 10) || 587 }))}
                  placeholder="587 oder 465"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  SMTP Benutzername / E-Mail <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  value={config.smtp_user}
                  onChange={(e) => setConfig((c) => ({ ...c, smtp_user: e.target.value }))}
                  placeholder="kontakt@gudpreiss.de"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  SMTP Passwort <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.smtp_password}
                    onChange={(e) => setConfig((c) => ({ ...c, smtp_password: e.target.value }))}
                    placeholder="Ihr sicheres SMTP-Passwort"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Verschlüsselung (Sicherheit)</label>
                <select
                  value={config.smtp_encryption}
                  onChange={(e) => {
                    const enc = e.target.value;
                    setConfig((c) => ({
                      ...c,
                      smtp_encryption: enc,
                      smtp_secure: enc === 'ssl' || c.smtp_port === 465,
                    }));
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="tls">TLS / STARTTLS (Port 587 - Empfohlen)</option>
                  <option value="ssl">SSL (Port 465)</option>
                  <option value="none">Keine Verschlüsselung (Port 25)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Sichere Verbindung erzwingen (SSL)</label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.smtp_secure}
                      onChange={(e) => setConfig((c) => ({ ...c, smtp_secure: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>SSL aktiv (Standard für Port 465)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: SENDER & ADMIN NOTIFICATIONS */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              2. Absender-Informationen &amp; Admin-Empfänger
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Absender-Name (From Name)</label>
                <input
                  type="text"
                  value={config.mail_from_name}
                  onChange={(e) => setConfig((c) => ({ ...c, mail_from_name: e.target.value }))}
                  placeholder="GudPreiss Deutschland"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Absender-E-Mail (From Email)</label>
                <input
                  type="email"
                  value={config.mail_from}
                  onChange={(e) => setConfig((c) => ({ ...c, mail_from: e.target.value }))}
                  placeholder="kontakt@gudpreiss.de"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                Admin-Benachrichtigungs-E-Mail (Empfänger für neue Bestellungen) <span className="text-emerald-600">*</span>
              </label>
              <input
                type="email"
                value={config.admin_notification_email}
                onChange={(e) => setConfig((c) => ({ ...c, admin_notification_email: e.target.value }))}
                placeholder="admin@gudpreiss.store"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                An diese Adresse wird sofort eine E-Mail gesendet, sobald ein Kunde eine neue Bestellung abschließt.
              </p>
            </div>
          </div>

          {/* SECTION C: RESEND API KEY (ALTERNATIVE) */}
          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              3. Resend API-Schlüssel (Alternative / Fallback-Dienst)
            </h4>
            <div>
              <label className="block text-xs font-bold mb-1">Resend API Key</label>
              <input
                type="password"
                value={config.resend_api_key}
                onChange={(e) => setConfig((c) => ({ ...c, resend_api_key: e.target.value }))}
                placeholder="re_..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Wird verwendet, wenn kein SMTP konfiguriert ist oder als Ausfallsicherung dient.
              </p>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
            >
              {savingConfig ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SPEICHERE EINSTELLUNGEN...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  E-MAIL-SERVERKONFIGURATION SPEICHERN
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2 & 3: TEMPLATES EDITORS */}
      {(activeTab === 'customer' || activeTab === 'admin') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
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
              onClick={handleSaveTemplates}
              disabled={savingTemplates}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
            >
              {savingTemplates ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              VORLAGE SPEICHERN
            </button>
            <button
              onClick={handleResetTemplate}
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
      )}

      {/* PREVIEW MODAL */}
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

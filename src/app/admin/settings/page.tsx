'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Sparkles } from 'lucide-react';
import { useStoreSettings } from '@/context/store-settings-context';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useStoreSettings();

  const [storeName, setStoreName] = useState(settings.store_name || 'GudPreiss');
  const [contactEmail, setContactEmail] = useState(settings.contact_email || 'support@gudpreiss.store');
  const [contactPhone, setContactPhone] = useState(settings.contact_phone || '+49 30 1234567');
  const [currency, setCurrency] = useState(settings.currency || 'EUR (€)');
  const [taxRate, setTaxRate] = useState(String((settings.tax_rate || 0.19) * 100));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(settings.free_shipping_threshold || 150));
  const [stripeEnabled, setStripeEnabled] = useState(settings.stripe_enabled ?? true);
  const [codEnabled, setCodEnabled] = useState(settings.cod_enabled ?? true);
  const [iban, setIban] = useState(settings.iban || '');
  const [bic, setBic] = useState(settings.bic || '');
  const [bankName, setBankName] = useState(settings.bank_name || '');
  const [accountHolder, setAccountHolder] = useState(settings.account_holder || '');
  const [vatNumber, setVatNumber] = useState(settings.vat_number || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name || 'GudPreiss');
      setContactEmail(settings.contact_email || 'support@gudpreiss.store');
      setContactPhone(settings.contact_phone || '+49 30 1234567');
      setCurrency(settings.currency || 'EUR (€)');
      setTaxRate(String((settings.tax_rate || 0.19) * 100));
      setFreeShippingThreshold(String(settings.free_shipping_threshold || 150));
      setStripeEnabled(settings.stripe_enabled ?? true);
      setCodEnabled(settings.cod_enabled ?? true);
      setIban(settings.iban || '');
      setBic(settings.bic || '');
      setBankName(settings.bank_name || '');
      setAccountHolder(settings.account_holder || '');
      setVatNumber(settings.vat_number || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      store_name: storeName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      currency,
      tax_rate: (Number(taxRate) || 19) / 100,
      free_shipping_threshold: Number(freeShippingThreshold) || 150,
      stripe_enabled: stripeEnabled,
      cod_enabled: codEnabled,
      iban,
      bic,
      bank_name: bankName,
      account_holder: accountHolder,
      vat_number: vatNumber,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6 text-slate-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">Einstellungen &amp; Plattformidentität</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
              Sofortige globale Änderung
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ändern Sie den Firmennamen, die E-Mail-Adresse, die Währung und die Konfigurationen. Änderungen werden sofort auf der gesamten Seite wirksam.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/settings/legal"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold text-xs rounded-xl flex items-center gap-2 border border-slate-700 transition shrink-0"
          >
            <span>⚖️ RECHTLICHE SEITEN &amp; CMS</span>
          </a>
          <a
            href="/admin/settings/branding"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-900/30 shrink-0"
          >
            <span>🎨 BRANDING &amp; LOGO</span>
          </a>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Plattformname und Einstellungen wurden auf der gesamten Seite aktualisiert!</span>
          </div>
        )}

        {/* General Store Settings */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Allgemeine Shop-Identität
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Firmenname der Plattform *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Kundensupport-E-Mail</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Financial & Taxes */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Währung, MwSt. &amp; Versand
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Hauptwährung</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              >
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">MwSt.-Satz (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Kostenloser Versand ab (€)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Bankverbindung &amp; Zahlungsdaten (SEPA)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Kontoinhaber</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="GudPreiss GmbH"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Bankname</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="GudPreiss Global Bank AG"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">IBAN</label>
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="DE89 3704 0044 0532 0130 00"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">BIC / SWIFT</label>
              <input
                type="text"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
                placeholder="DEUTDEDDBER"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">USt-IdNr. / VAT</label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder="DE 349 812 705"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Diese Daten werden auf der Checkout-Seite, der Bestellbestätigung und im Impressum angezeigt.
          </p>
        </div>

        {/* Payment Gateways */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Zahlungsanbieter
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={stripeEnabled}
                onChange={(e) => setStripeEnabled(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Kreditkarten aktivieren (Stripe / Visa / Mastercard)</span>
            </label>
            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>SEPA-Überweisung aktivieren</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
          <span>{saved ? 'EINSTELLUNGEN GESPEICHERT!' : 'EINSTELLUNGEN SPEICHERN'}</span>
        </button>
      </form>
    </div>
  );
}

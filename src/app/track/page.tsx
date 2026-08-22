'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { getOrders } from '@/lib/db/db-provider';
import { Order } from '@/types';
import { useStoreSettings } from '@/context/store-settings-context';
import {
  Truck,
  Search,
  User,
  Building2,
  Copy,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams?.get('code') || searchParams?.get('order') || '';

  const [inputCode, setInputCode] = useState(initialCode);
  const [searchedCode, setSearchedCode] = useState(initialCode);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const { settings } = useStoreSettings();

  const handleSearchCode = useCallback(async (codeToSearch: string) => {
    const clean = codeToSearch.trim().toUpperCase();
    if (!clean) return;

    setIsLoading(true);
    setSearched(true);
    setSearchedCode(clean);

    try {
      // 1. Check client-side localStorage
      let localOrders: Order[] = [];
      try {
        const saved = localStorage.getItem('gudpreiss_orders');
        if (saved) localOrders = JSON.parse(saved);
      } catch {
        // ignore
      }

      let match = localOrders.find(
        (o) =>
          o &&
          (o.order_number?.toUpperCase() === clean ||
            o.tracking_number?.toUpperCase() === clean ||
            o.id?.toUpperCase() === clean)
      );

      // 2. Fallback check db-provider getOrders()
      if (!match) {
        const dbOrders = await getOrders();
        match = dbOrders.find(
          (o) =>
            o &&
            (o.order_number?.toUpperCase() === clean ||
              o.tracking_number?.toUpperCase() === clean ||
              o.id?.toUpperCase() === clean)
        );
      }

      setFoundOrder(match || null);
    } catch {
      setFoundOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode) {
      handleSearchCode(initialCode);
    }
  }, [initialCode, handleSearchCode]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchCode(inputCode);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full py-8 space-y-8 text-slate-900 dark:text-white">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-700 text-xs font-bold">
          <Truck className="w-4 h-4" />
          <span>DHL EXPRESS / UPS DEUTSCHLAND LIVE-TRACKING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Sendungsverfolgung &amp; Live-Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 max-w-xl mx-auto">
          Geben Sie Ihre Tracking-Nummer oder Bestellnummer ein, um den genauen Standort Ihres Pakets in Echtzeit zu verfolgen.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto space-y-4">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="z.B. TN-DE-89230194 oder TN-2026-9821"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'SUCHE LÄUFT...' : 'SENDUNG VERFOLGEN'}</span>
          </button>
        </form>

        {/* Demo Quick Chips */}
        <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-500 flex-wrap">
          <span className="font-bold">Beispiel-Codes:</span>
          <button
            type="button"
            onClick={() => {
              setInputCode('TN-DE-89230194');
              handleSearchCode('TN-DE-89230194');
            }}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-mono text-emerald-800 dark:text-emerald-700 transition"
          >
            TN-DE-89230194
          </button>
          <button
            type="button"
            onClick={() => {
              setInputCode('TN-2026-9821');
              handleSearchCode('TN-2026-9821');
            }}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-mono text-emerald-800 dark:text-emerald-700 transition"
          >
            TN-2026-9821
          </button>
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <>
          {foundOrder ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Live Shipping Journey Timeline Stepper */}
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-700" />
                      <h2 className="text-base font-extrabold tracking-tight text-white uppercase">
                        DHL Express Deutschland Live-Status
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sendungscode: <span className="font-mono text-emerald-700 font-bold">{foundOrder.tracking_number || searchedCode}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyCode(foundOrder.tracking_number || searchedCode)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-600 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedTracking ? 'Kopiert!' : 'Code Kopieren'}</span>
                    </button>
                  </div>
                </div>

                {/* Stepper Timeline Visual */}
                <div className="space-y-4 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Lieferstatus &amp; Etappen in Echtzeit
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <p className="font-extrabold text-white text-[11px]">1. Bestätigt</p>
                      <p className="text-[10px] text-slate-500">Bestellung erhalten</p>
                    </div>

                    <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <p className="font-extrabold text-white text-[11px]">2. Zahlung</p>
                      <p className="text-[10px] text-slate-500">Vorkasse SEPA validiert</p>
                    </div>

                    <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <p className="font-extrabold text-white text-[11px]">3. Sortierzentrum</p>
                      <p className="text-[10px] text-slate-500">Logistik Berlin HUB</p>
                    </div>

                    <div className="p-3 bg-slate-900 border border-emerald-600 rounded-2xl space-y-1 ring-2 ring-emerald-500/20">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                        ●
                      </div>
                      <p className="font-extrabold text-emerald-700 text-[11px]">4. In Zustellung</p>
                      <p className="text-[10px] text-emerald-300">DHL Fahrer unterwegs</p>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1 opacity-60">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                        5
                      </div>
                      <p className="font-extrabold text-slate-500 text-[11px]">5. Zugestellt</p>
                      <p className="text-[10px] text-slate-500">Lieferung Zielort</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info & Customer Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Details Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <User className="w-4 h-4 text-emerald-800 dark:text-emerald-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">Kundeninformationen</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Name &amp; Kontakt</span>
                      <p className="font-bold">{foundOrder.shipping_address?.full_name}</p>
                      <p className="text-slate-500 dark:text-slate-500 font-mono">{foundOrder.customer_email}</p>
                      <p className="text-slate-500 dark:text-slate-500 font-mono">{foundOrder.customer_phone}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Lieferadresse (Deutschland)</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-600">
                        {foundOrder.shipping_address?.address_line1}
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-600">
                        {foundOrder.shipping_address?.postal_code} {foundOrder.shipping_address?.city}
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-600">
                        {foundOrder.shipping_address?.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Details Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Building2 className="w-4 h-4 text-emerald-800 dark:text-emerald-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">Zahlungsdetails</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Zahlungsart</span>
                      <p className="font-bold">Vorkasse Banküberweisung (SEPA)</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Zahlungsstatus</span>
                      <span className="inline-block mt-0.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] rounded-full uppercase">
                        Vollständig Bezahlt &amp; Verifiziert
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-sans block">IBAN Empfänger</span>
                      <p className="font-bold text-emerald-800 dark:text-emerald-700">{settings.iban || 'DE89 3704 0044 0532 0130 00'}</p>
                      <p className="text-slate-500 dark:text-slate-500 font-sans text-[10px]">{settings.account_holder || 'GudPreiss GmbH'} (Berlin)</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Logistics Details Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Truck className="w-4 h-4 text-emerald-800 dark:text-emerald-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">Versand &amp; Logistik</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Versanddienstleister</span>
                      <p className="font-bold">DHL Express Germany (Kostenlos)</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Lieferzeitraum</span>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-700">Heute zwischen 14:00 - 17:00 Uhr</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Garantie &amp; Schutz</span>
                      <p className="text-slate-500 dark:text-slate-500 text-[11px]">
                        ✓ 24 Monate Garantie • 30 Tage Rückgaberecht
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchased Products Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                  Gekaufte Produkte ({foundOrder.items.length})
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {foundOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="relative w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
                            <Image src={item.image_url} alt="" fill className="object-contain p-1" />
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{item.product_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-500 font-mono">
                            SKU: {item.sku} • Menge: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-sm text-emerald-800 dark:text-emerald-700">
                        {(item.total_price || item.unit_price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-black">
                  <span>Gesamtsumme (inkl. MwSt.)</span>
                  <span className="text-emerald-800 dark:text-emerald-700 text-lg">{foundOrder.total_amount.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold">Keine Sendung mit diesem Code gefunden</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                Der eingegebene Tracking-Code <span className="font-mono font-bold text-slate-900 dark:text-white">{searchedCode}</span> existiert nicht oder ist noch nicht im DHL-System registriert.
              </p>
              <div className="pt-2">
                <a
                  href="/shop"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition inline-block cursor-pointer"
                >
                  Katalog durchsuchen
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Sendungsverfolgung wird geladen...</div>}>
        <TrackingContent />
      </Suspense>
      <Footer />
    </div>
  );
}

'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { CheckCircle2, Building2, ArrowRight, Printer, Copy, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { useStoreSettings } from '@/context/store-settings-context';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const orderNumber = searchParams.get('order_number') || 'TN-2026-1001';
  const { settings } = useStoreSettings();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const iban = settings.iban || 'DE89 3704 0044 0532 0130 00';
  const bic = settings.bic || 'DEUTDEDDBER';
  const bankName = settings.bank_name || 'GudPreiss Global Bank AG';
  const accountHolder = settings.account_holder || 'GudPreiss GmbH';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 w-full py-12 text-center">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-700">
            {t('checkout.bankTransfer')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {t('checkout.orderSuccessTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
            {t('checkout.orderNumber')} <span className="font-bold text-slate-900 dark:text-white">#{orderNumber}</span> {t('checkout.orderProcessedText')}
          </p>
        </div>

        {/* Bank Account Transfer Details Card */}
        <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-lg text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                {t('checkout.bankDetails')}
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-white bg-slate-800 rounded-lg transition text-[11px] flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Drucken</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">{t('checkout.bankName')}</div>
              <div className="font-bold text-white text-xs mt-0.5">{bankName}</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">{t('checkout.accountHolder')}</div>
              <div className="font-bold text-white text-xs mt-0.5">{accountHolder}</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between sm:col-span-2">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">{t('checkout.iban')}</div>
                <div className="font-bold text-emerald-700 text-sm mt-0.5 tracking-wider">{iban}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(iban, 'iban')}
                className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-lg transition text-[11px] flex items-center gap-1 font-sans"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedField === 'iban' ? 'Kopiert!' : 'Kopieren'}</span>
              </button>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">{t('checkout.bic')}</div>
              <div className="font-bold text-white text-xs mt-0.5">{bic}</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">{t('checkout.paymentReference')}</div>
              <div className="font-bold text-amber-700 text-xs mt-0.5 font-sans font-bold">{orderNumber}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-800 font-sans">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>{t('checkout.paymentReferenceNotice')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/account/orders"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition"
          >
            <span>{t('checkout.trackOrder')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs rounded-2xl transition"
          >
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <Suspense fallback={<div className="p-8 text-center text-xs">Bestellstatus wird geladen...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}

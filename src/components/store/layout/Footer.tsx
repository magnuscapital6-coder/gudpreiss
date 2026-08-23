'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { useStoreSettings } from '@/context/store-settings-context';

export function Footer() {
  const { t } = useTranslation();
  const { settings } = useStoreSettings();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-border-soft dark:border-slate-800 text-text-secondary dark:text-slate-400 text-xs pt-8 sm:pt-12 pb-8 transition-colors duration-300">
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-border-soft dark:border-slate-800 text-center md:text-left">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3 flex flex-col items-center md:items-start">
            <span className="text-[24px] font-black tracking-tight text-slate-900 dark:text-white">
              <span className="text-emerald-800 dark:text-emerald-400">
                {settings?.store_name ? settings.store_name.slice(0, Math.ceil(settings.store_name.length / 2)) : 'Tech'}
              </span>
              {settings?.store_name ? settings.store_name.slice(Math.ceil(settings.store_name.length / 2)) : 'nova'}
            </span>
            <p className="text-text-muted dark:text-slate-400 leading-relaxed max-w-sm">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary dark:text-slate-100 text-sm uppercase tracking-wider">
              {t('nav.shop')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/shop?category=smartphones" className="hover:text-primary-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">{t('nav.smartphones')}</Link></li>
              <li><Link href="/shop?category=laptops" className="hover:text-primary-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">{t('nav.laptops')}</Link></li>
              <li><Link href="/shop?category=headphones" className="hover:text-primary-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">{t('nav.headphones')}</Link></li>
              <li><Link href="/shop?category=gaming" className="hover:text-primary-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">{t('nav.gaming')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary dark:text-slate-100 text-sm uppercase tracking-wider">
              {t('footer.customerService')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-emerald-500 font-bold transition text-slate-700 dark:text-slate-300">Blog &amp; Magazin</Link></li>
              <li><Link href="/contact" className="hover:text-primary-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">{t('nav.contact')}</Link></li>
              <li><Link href="/faq" className="hover:text-primary-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">FAQ</Link></li>
              <li><Link href="/track" className="hover:text-emerald-500 font-bold transition text-emerald-800 dark:text-emerald-400">Sendungsverfolgung</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary dark:text-slate-100 text-sm uppercase tracking-wider">
              Rechtliches / Legal
            </h4>
            <ul className="space-y-2">
              <li><Link href="/impressum" className="hover:text-emerald-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">Impressum</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">Datenschutzerklärung</Link></li>
              <li><Link href="/datenschutz-center" className="hover:text-emerald-500 font-semibold text-emerald-600 dark:text-emerald-400 transition">Datenschutz-Center &amp; Rechte</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">AGB &amp; Bedingungen</Link></li>
              <li><Link href="/return-policy" className="hover:text-emerald-500 dark:hover:text-emerald-700 dark:text-emerald-400 transition">Widerrufsbelehrung &amp; Rückgabe</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-text-muted gap-4 text-center sm:text-left">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Stripe</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

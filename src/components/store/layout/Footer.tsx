'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { useStoreSettings } from '@/context/store-settings-context';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const { settings } = useStoreSettings();

  const storeName = settings?.store_name || 'GudPreiss';

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-border-soft dark:border-slate-800 text-text-secondary dark:text-slate-400 text-xs pt-8 sm:pt-12 pb-8 transition-colors duration-300">
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-border-soft dark:border-slate-800 text-center md:text-left">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3 flex flex-col items-center md:items-start">
            <span className="text-[22px] sm:text-[24px] font-black tracking-tight text-slate-900 dark:text-white">
              <span className="text-emerald-800 dark:text-emerald-400">Gud</span>Preiss
            </span>
            <p className="text-text-muted dark:text-slate-400 leading-relaxed max-w-sm">
              Ihr zertifizierter Online-Shop für E-Bikes, PlayStation 5 Konsolen, Gaming-Zubehör und Unterhaltungselektronik zu Bestpreisen.
            </p>
            <div className="pt-2 text-xs space-y-1 text-slate-600 dark:text-slate-400 font-medium">
              <p>📍 Friedrichstraße 123, 10117 Berlin, Deutschland</p>
              <p>📞 +49 15731294173 | ✉️ kontakt@gudpreiss.de</p>
              <p>🏢 USt-IdNr.: DE 358 921 476 | GudPreiss E-Commerce</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary dark:text-slate-100 text-sm uppercase tracking-wider">
              Kategorien &amp; Produkte
            </h4>
            <ul className="space-y-2">
              <li><Link href="/shop?category=e-bikes" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">E-Bikes &amp; Elektrofahrräder</Link></li>
              <li><Link href="/shop?category=playstation-konsolen" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">PlayStation Konsolen</Link></li>
              <li><Link href="/shop?category=playstation-controller-zubehoer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Controller &amp; Zubehör</Link></li>
              <li><Link href="/shop?category=playstation-audio-vr" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Audio &amp; VR Headsets</Link></li>
              <li><Link href="/shop?category=playstation-ssd-speicher" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">SSD &amp; Speichererweiterung</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary dark:text-slate-100 text-sm uppercase tracking-wider">
              {t('footer.customerService')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">{t('nav.contact')}</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">FAQ &amp; Hilfe</Link></li>
              <li><Link href="/track" className="hover:text-emerald-600 font-bold transition text-emerald-800 dark:text-emerald-400">Sendungsverfolgung</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary dark:text-slate-100 text-sm uppercase tracking-wider">
              Rechtliches / Legal
            </h4>
            <ul className="space-y-2">
              <li><Link href="/impressum" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Impressum</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Datenschutzerklärung</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">AGB &amp; Bedingungen</Link></li>
              <li><Link href="/return-policy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Widerrufsbelehrung &amp; Rückgabe</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-text-muted gap-4 text-center sm:text-left text-xs">
          <p>© {new Date().getFullYear()} GudPreiss. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4 text-emerald-600" /> SEPA Vorkasse / Banküberweisung</span>
            <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-emerald-600" /> Gratis Versand ab 500 €</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Käuferschutz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

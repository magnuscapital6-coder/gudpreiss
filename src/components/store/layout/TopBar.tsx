'use client';

import React from 'react';
import { Truck, HelpCircle, ChevronDown, MapPin } from 'lucide-react';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useTranslation } from '@/context/language-context';

export function TopBar() {
  const { t } = useTranslation();

  return (
    <div className="bg-emerald-800 dark:bg-emerald-950 text-white text-[11px] h-auto min-h-[30px] sm:min-h-[32px] py-1 flex items-center shadow-xs">
      <div className="mx-auto w-full max-w-[1360px] px-3 sm:px-6 lg:px-8">
        
        {/* Mobile View: 100% Centered, Clean, Single-Line */}
        <div className="sm:hidden flex items-center justify-center gap-1.5 w-full text-center font-extrabold text-[11px] text-white">
          <Truck className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
          <span className="truncate tracking-tight">{t('nav.freeShipping') || 'Livraison gratuite & Expédition rapide'}</span>
        </div>

        {/* Tablet & Desktop View */}
        <div className="hidden sm:flex justify-between items-center w-full">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-white truncate">
              {t('nav.welcome')}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto text-emerald-100">
            <div className="hidden md:flex items-center gap-1 text-white">
              <MapPin className="w-3 h-3 text-emerald-200" />
              <span>{t('nav.storeLocator')}</span>
            </div>

            <div className="h-3 w-px bg-emerald-500/40 hidden md:block" />

            <div className="flex items-center gap-1 text-white font-extrabold">
              <Truck className="w-3.5 h-3.5 text-emerald-200" />
              <span className="truncate">{t('nav.freeShipping')}</span>
            </div>

            <div className="h-3 w-px bg-emerald-500/40 hidden lg:block" />

            <a href="/track" className="hidden lg:flex items-center gap-1.5 text-white font-black hover:underline transition">
              <Truck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Sendungsverfolgung</span>
            </a>

            <div className="h-3 w-px bg-emerald-500/40 hidden lg:block" />

            <a href="/contact" className="hidden lg:flex items-center gap-1 text-white hover:text-emerald-200 transition">
              <HelpCircle className="w-3 h-3 text-emerald-200" />
              <span>{t('nav.help')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

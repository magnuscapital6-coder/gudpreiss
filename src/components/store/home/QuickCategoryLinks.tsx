'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Sparkles, Star, Tag, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

export function QuickCategoryLinks() {
  const { t } = useTranslation();

  const links = [
    {
      title: t('quickLinks.bestsellers'),
      icon: Flame,
      bgColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      href: '/shop?sort=best-selling',
    },
    {
      title: t('quickLinks.newArrivals'),
      icon: Sparkles,
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400',
      href: '/shop?sort=newest',
    },
    {
      title: t('quickLinks.topRated'),
      icon: Star,
      bgColor: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
      href: '/shop?sort=rating',
    },
    {
      title: t('quickLinks.onSale'),
      icon: Tag,
      bgColor: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
      href: '/shop?on_sale=true',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      {links.map((link, idx) => {
        const Icon = link.icon;
        return (
          <Link
            key={idx}
            href={link.href}
            prefetch={true}
            className="group bg-white dark:bg-slate-950 border border-[#EEF2F7] dark:border-slate-800/80 rounded-[8px] h-[58px] px-3.5 flex items-center justify-between hover:shadow-card hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${link.bgColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-text-primary dark:text-slate-100 group-hover:text-primary-500 dark:group-hover:text-emerald-400 transition">
                  {link.title}
                </span>
                <span className="text-[10px] font-semibold text-primary-500 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                  {t('quickLinks.shopNow')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { getValidImageUrl } from '@/lib/image-fallback';

export function CategoryPromoCards() {
  const { t } = useTranslation();

  const cards = [
    {
      title: t('home.gameControllers') || 'IT & Tech Zubehör',
      price: `${t('home.fromPrice')} 160 €`,
      image: getValidImageUrl(undefined, 'it-zubehoer'),
      link: '/shop?category=accessoires',
    },
    {
      title: t('nav.smartphones') || 'Smartphones & Tablets',
      price: `${t('home.fromPrice')} 650 €`,
      image: getValidImageUrl(undefined, 'smartphones-tablets'),
      link: '/shop?category=smartphones-tablettes',
    },
    {
      title: 'Laptops & Desktop-PCs',
      price: `${t('home.fromPrice')} 450 €`,
      image: getValidImageUrl(undefined, 'laptops-pcs'),
      link: '/shop?category=laptop-bureau',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-950 border border-[#EEF2F7] dark:border-slate-800/80 rounded-[10px] p-3.5 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left shadow-card hover:shadow-hover transition-all duration-150 group gap-4 h-auto sm:h-[130px] overflow-hidden"
        >
          {/* Left Text & CTA Column */}
          <div className="flex flex-col justify-between items-center sm:items-start h-full py-1 min-w-0 flex-1">
            <div>
              <h3 className="text-[15px] sm:text-[16px] font-bold text-text-primary dark:text-slate-100 group-hover:text-primary-500 dark:group-hover:text-emerald-400 transition line-clamp-1">
                {card.title}
              </h3>
              <p className="text-[12px] font-semibold text-primary-500 dark:text-emerald-400 mt-1">{card.price}</p>
            </div>

            <Link
              href={card.link}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-500 dark:text-emerald-400 hover:text-primary-600 uppercase tracking-wider mt-3 sm:mt-auto group/link"
            >
              <span>{t('quickLinks.shopNow')}</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Right Square Image Container (1:1 Aspect Ratio Spanning 100% Height) */}
          <div className="relative aspect-square w-[110px] h-[110px] sm:w-auto sm:h-full rounded-[8px] overflow-hidden bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 flex-shrink-0">
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

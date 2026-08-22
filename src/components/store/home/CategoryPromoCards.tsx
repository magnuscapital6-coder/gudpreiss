'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/db/initial-data';

interface CategoryPromoCardsProps {
  products?: Product[];
}

export function CategoryPromoCards({ products = [] }: CategoryPromoCardsProps) {
  const { t } = useTranslation();

  const allProducts = products.length > 0 ? products : INITIAL_PRODUCTS;

  // Find real products for each category
  const itProd = allProducts.find((p) =>
    (p.category_name || '').toLowerCase().includes('zubehör') ||
    (p.category_name || '').toLowerCase().includes('accessoire') ||
    (p.name || '').toLowerCase().includes('controller') ||
    (p.name || '').toLowerCase().includes('maus') ||
    (p.name || '').toLowerCase().includes('tastatur')
  ) || allProducts[0];

  const phoneProd = allProducts.find((p) =>
    (p.category_name || '').toLowerCase().includes('smartphone') ||
    (p.category_name || '').toLowerCase().includes('handy') ||
    (p.name || '').toLowerCase().includes('iphone') ||
    (p.name || '').toLowerCase().includes('galaxy')
  ) || allProducts[1] || allProducts[0];

  const laptopProd = allProducts.find((p) =>
    (p.category_name || '').toLowerCase().includes('laptop') ||
    (p.category_name || '').toLowerCase().includes('computer') ||
    (p.name || '').toLowerCase().includes('macbook') ||
    (p.name || '').toLowerCase().includes('pc')
  ) || allProducts[2] || allProducts[0];

  const cards = [
    {
      title: itProd?.name || 'IT & Tech Zubehör',
      price: `${t('home.fromPrice') || 'Ab'} ${itProd?.price || 160} €`,
      image: itProd?.images?.[0] || '',
      link: itProd ? `/shop/${itProd.slug}` : '/shop',
    },
    {
      title: phoneProd?.name || 'Smartphones & Tablets',
      price: `${t('home.fromPrice') || 'Ab'} ${phoneProd?.price || 650} €`,
      image: phoneProd?.images?.[0] || '',
      link: phoneProd ? `/shop/${phoneProd.slug}` : '/shop',
    },
    {
      title: laptopProd?.name || 'Laptops & Desktop-PCs',
      price: `${t('home.fromPrice') || 'Ab'} ${laptopProd?.price || 450} €`,
      image: laptopProd?.images?.[0] || '',
      link: laptopProd ? `/shop/${laptopProd.slug}` : '/shop',
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
              <h3 className="text-[15px] sm:text-[16px] font-bold text-text-primary dark:text-slate-100 group-hover:text-primary-500 dark:group-hover:text-emerald-700 dark:text-emerald-400 transition line-clamp-1">
                {card.title}
              </h3>
              <p className="text-[12px] font-semibold text-primary-500 dark:text-emerald-400 mt-1">{card.price}</p>
            </div>

            <Link
              href={card.link}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-500 dark:text-emerald-400 hover:text-primary-600 uppercase tracking-wider mt-3 sm:mt-auto group/link"
            >
              <span>{t('quickLinks.shopNow') || 'JETZT EINKAUFEN'}</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Right Square Image Container */}
          <div className="relative aspect-square w-[110px] h-[110px] sm:w-auto sm:h-full rounded-[8px] overflow-hidden bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 flex-shrink-0">
            {card.image && (
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="110px"
                className="object-contain p-1.5 w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

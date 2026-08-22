'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import Link from 'next/link';
import { Star, ArrowRight, Award } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface TopRatedSectionProps {
  products: Product[];
}

export function TopRatedSection({ products }: TopRatedSectionProps) {
  const { t } = useTranslation();

  // Filter top rated products (rating >= 4.5 or featured)
  const topRatedProducts = products
    .filter((p) => (p.rating && p.rating >= 4.5) || p.featured || p.best_seller)
    .slice(0, 4);

  return (
    <section className="my-6 sm:my-8 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-5 sm:p-7 shadow-xs transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200/70 dark:border-slate-800/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-widest mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>KUNDENLIEBLINGE</span>
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Top-bewertete Tech-Highlights</span>
            <Award className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
          </h2>
        </div>

        <Link
          href="/shop?sort=rating"
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 transition"
        >
          <span>{t('home.viewAll') || 'Alle anzeigen'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of 4 Top Rated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {topRatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

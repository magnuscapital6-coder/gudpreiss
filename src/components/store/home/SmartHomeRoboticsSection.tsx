'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import Link from 'next/link';
import { Cpu, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface SmartHomeRoboticsSectionProps {
  products: Product[];
}

export function SmartHomeRoboticsSection({ products }: SmartHomeRoboticsSectionProps) {
  const { t } = useTranslation();

  // Filter smart home, robotics, appliances & home tech
  const smartProducts = products
    .filter(
      (p) =>
        p.category_id?.includes('aspirateur') ||
        p.category_id?.includes('home') ||
        p.category_name?.toLowerCase().includes('staubsauger') ||
        p.category_name?.toLowerCase().includes('haushalt') ||
        p.category_name?.toLowerCase().includes('grill') ||
        p.category_name?.toLowerCase().includes('küche') ||
        p.name?.toLowerCase().includes('robot') ||
        p.name?.toLowerCase().includes('cleaner')
    )
    .slice(0, 4);

  const displayProducts = smartProducts.length >= 3 ? smartProducts : products.slice(4, 8);

  return (
    <section className="my-6 sm:my-8 bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-5 sm:p-7 shadow-xs transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200/70 dark:border-slate-800/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-widest mb-1">
            <span>ZUKUNFTS-TECHNOLOGIE</span>
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Smart Home & Robotik für Ihr Zuhause</span>
            <Cpu className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
          </h2>
        </div>

        <Link
          href="/shop?category=aspirateurs"
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 transition"
        >
          <span>{t('home.viewAll') || 'Alle anzeigen'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of 4 Smart Home Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

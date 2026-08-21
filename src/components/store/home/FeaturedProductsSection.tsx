'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Crown } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface FeaturedProductsSectionProps {
  products: Product[];
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  const { t } = useTranslation();
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);

  // Pick 8 random products spanning 8 DIFFERENT categories for a rich diverse Bestsellers mix
  useEffect(() => {
    if (!products || products.length === 0) return;

    // Group products by category ID or Name
    const categoryMap = new Map<string, Product[]>();
    for (const p of products) {
      const catKey = (p.category_id || p.category_name || 'general').toLowerCase().trim();
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, []);
      }
      categoryMap.get(catKey)!.push(p);
    }

    // Shuffle categories to get a completely random mix
    const categoryPools = Array.from(categoryMap.values()).sort(() => 0.5 - Math.random());

    const selected: Product[] = [];
    for (const pool of categoryPools) {
      // Pick a random product from this category
      const randomProd = pool[Math.floor(Math.random() * pool.length)];
      selected.push(randomProd);
      if (selected.length >= 8) break;
    }

    // Fill remaining if less than 8 categories found
    if (selected.length < 8) {
      const remaining = products.filter((p) => !selected.some((s) => s.id === p.id));
      const shuffled = [...remaining].sort(() => 0.5 - Math.random());
      selected.push(...shuffled.slice(0, 8 - selected.length));
    }

    setBestsellerProducts(selected);
  }, [products]);

  const displayProducts = bestsellerProducts.length > 0 ? bestsellerProducts : products.slice(0, 8);

  return (
    <section className="my-6 sm:my-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        
        {/* Left Column (8 cols): TRENDING NOW Bestsellers */}
        <div className="lg:col-span-8 flex flex-col justify-start bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-5 sm:p-6 shadow-xs">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block mb-0.5">
                TRENDING NOW
              </span>
              <h2 className="text-[20px] sm:text-[24px] font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Bestseller
              </h2>
            </div>

            <Link
              href="/shop?sort=best-selling"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition"
            >
              <span>{t('home.viewAll') || 'Alle anzeigen'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Cards Grid: 4 cards per row across 2 rows (8 total) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Dark Green Exclusive Club Banner Card */}
        <div className="lg:col-span-4 flex">
          <div className="relative rounded-[24px] bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 sm:p-7 w-full flex flex-col justify-between overflow-hidden shadow-lg border border-emerald-800/40 group min-h-[340px]">
            
            {/* Background Model Image */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-35 mix-blend-luminosity pointer-events-none z-0">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                alt="TechNova Member"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Subtle radial spotlight aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none z-0" />

            {/* Foreground Content */}
            <div className="relative z-10 space-y-4 max-w-[260px]">
              
              {/* Crown Icon Badge */}
              <div className="w-10 h-10 rounded-2xl bg-emerald-800/60 border border-emerald-600/40 flex items-center justify-center text-amber-300 shadow-md">
                <Crown className="w-5 h-5" />
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                  Werde VIP Club Mitglied
                </h3>
                <p className="text-xs font-semibold text-emerald-200/90 mt-1.5 leading-relaxed">
                  Erhalte exklusive Angebote, 10% Willkommens-Rabatt & 24h Prioritäts-Versand.
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-2 pt-1">
                {[
                  '10% Sofort-Rabatt auf 1. Bestellung',
                  'Kostenlose Premium-Lieferung',
                  'Exklusive VIP-Angebote & Pre-Access',
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-200">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="relative z-10 pt-5">
              <Link
                href="/shop?sort=best-selling"
                prefetch={true}
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-11 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 w-full cursor-pointer"
              >
                <span>JETZT BEITRETEN</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

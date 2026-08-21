'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { SectionHeader } from '@/components/ui/section-header';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Percent } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface JustArrivedSectionProps {
  products: Product[];
}

export function JustArrivedSection({ products }: JustArrivedSectionProps) {
  const { t } = useTranslation();
  const newArrivals = products.filter((p) => p.new_arrival || p.featured).slice(0, 3);

  // Filter on-sale promo products
  const saleProducts = products.filter((p) => p.on_sale || (p.compare_at_price && p.compare_at_price > p.price));
  const activeSaleProducts = saleProducts.length > 0 ? saleProducts : products.slice(0, 5);

  // Offset index so Card 2 NEVER displays the same product as Card 1 (which starts at index 0)
  const offset = Math.max(1, Math.floor(activeSaleProducts.length / 2));
  const [promoStep, setPromoStep] = useState(0);

  useEffect(() => {
    if (activeSaleProducts.length <= 1) return;
    const interval = setInterval(() => {
      setPromoStep((prev) => (prev + 1) % activeSaleProducts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeSaleProducts.length]);

  // Guaranteed distinct product calculation (opposite side of array)
  const currentPromoIndex = (promoStep + offset) % activeSaleProducts.length;
  const currentPromo = activeSaleProducts[currentPromoIndex] || products[1] || products[0];

  return (
    <section className="my-4 sm:my-5">
      <SectionHeader title={t('home.justArrived')} viewAllHref="/shop?sort=newest" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* 3 Product cards (1 per row on phone, 3 on desktop) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right Rotating Side Promo Card - Soft Faded Border */}
        <div className="lg:col-span-4">
          <div className="relative rounded-[16px] border border-slate-200/50 p-5 sm:p-6 h-full min-h-[320px] flex flex-col justify-between items-center text-center lg:text-left lg:items-start overflow-hidden shadow-[0_8px_25px_-8px_rgba(0,0,0,0.12)] group transition-all duration-300 bg-slate-950">
            {/* Full Cover Background Image */}
            <Image
              src={currentPromo?.images?.[0] || 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=800'}
              alt={currentPromo?.name || 'Weekly discount product'}
              fill
              priority
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 z-0 opacity-90"
            />

            {/* Black Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/90 z-10 pointer-events-none" />

            {/* Soft Faded Edge Vignette */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-[16px] z-10 pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-20 w-full flex flex-col justify-between h-full">
              {/* Header Badge & Counter */}
              <div className="w-full flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  <Percent className="w-3.5 h-3.5" />
                  <span>RABATT BIS ZU 35%</span>
                </span>
                {activeSaleProducts.length > 1 && (
                  <span className="text-[10px] font-bold text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
                    {currentPromoIndex + 1} / {activeSaleProducts.length}
                  </span>
                )}
              </div>

              {/* Product Meta & Pricing */}
              <div className="w-full my-auto py-2">
                <h3 className="text-[18px] sm:text-[20px] font-extrabold text-white group-hover:text-amber-300 transition line-clamp-2 drop-shadow-md">
                  {currentPromo?.name}
                </h3>
                <p className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider line-clamp-1 mt-1">
                  {t('home.weeklyDiscounts')}
                </p>

                <div className="flex items-baseline gap-2.5 mt-3 justify-center lg:justify-start">
                  <span className="text-[11px] text-slate-300 font-medium">{t('home.shippingAt')}</span>
                  <span className="text-[24px] sm:text-[26px] font-black text-amber-400 drop-shadow-md">
                    {currentPromo?.price.toLocaleString('de-DE')} €
                  </span>
                  {currentPromo?.compare_at_price && currentPromo.compare_at_price > currentPromo.price && (
                    <span className="text-[13px] font-semibold text-slate-400 line-through">
                      {currentPromo.compare_at_price.toLocaleString('de-DE')} €
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Link Button */}
              <Link
                href={`/shop/${currentPromo?.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-[13px] h-[44px] px-6 rounded-xl transition shadow-lg mt-2 group/btn cursor-pointer"
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

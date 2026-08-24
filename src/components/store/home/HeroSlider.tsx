'use client';

import React, { useState, useEffect } from 'react';
import { Banner, Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface HeroSliderProps {
  banners?: Banner[];
  products?: Product[];
}

export function HeroSlider({ banners = [], products = [] }: HeroSliderProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activePromoItems, setActivePromoItems] = useState<Product[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Pick top priority PlayStation and E-Bike products for the Hero Swap Card
  useEffect(() => {
    if (!products || products.length === 0) return;

    const psProducts = products.filter((p) =>
      p.category_id?.includes('ps5') ||
      p.brand_id === 'b-sony-playstation' ||
      p.name.toLowerCase().includes('playstation') ||
      p.name.toLowerCase().includes('ps5') ||
      p.name.toLowerCase().includes('dualsense') ||
      p.name.toLowerCase().includes('vr2')
    );

    const bikeProducts = products.filter((p) =>
      p.category_id?.includes('e-') ||
      p.category_id === 'cat-ebikes' ||
      p.brand_id === 'b-cube' ||
      p.brand_id === 'b-scott' ||
      p.brand_id === 'b-haibike' ||
      p.brand_id === 'b-conway' ||
      p.brand_id === 'b-kalkhoff' ||
      p.brand_id === 'b-winora' ||
      p.name.toLowerCase().includes('bike') ||
      p.name.toLowerCase().includes('cube') ||
      p.name.toLowerCase().includes('scott')
    );

    const otherProducts = products.filter(
      (p) => !psProducts.includes(p) && !bikeProducts.includes(p)
    );

    // Interleave PlayStation & E-Bike products: [PS5, E-Bike, PS5, E-Bike...]
    const priorityPool: Product[] = [];
    const maxLen = Math.max(psProducts.length, bikeProducts.length);
    for (let i = 0; i < maxLen; i++) {
      if (psProducts[i]) priorityPool.push(psProducts[i]);
      if (bikeProducts[i]) priorityPool.push(bikeProducts[i]);
    }

    const selected = [...priorityPool, ...otherProducts].slice(0, 8);
    setActivePromoItems(selected);
  }, [products]);

  // Autoplay every 5 seconds
  useEffect(() => {
    if (isPaused || activePromoItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePromoItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, activePromoItems.length]);

  // Trigger CSS animation on index change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (activePromoItems.length === 0) return null;

  const currentProduct = activePromoItems[currentIndex];
  const nextProduct = activePromoItems[(currentIndex + 1) % activePromoItems.length];
  const prevProduct = activePromoItems[(currentIndex - 1 + activePromoItems.length) % activePromoItems.length];

  const productImage = currentProduct?.images?.[0] || '';
  const discountPercent = currentProduct.compare_at_price && currentProduct.compare_at_price > currentProduct.price
    ? Math.round(((currentProduct.compare_at_price - currentProduct.price) / currentProduct.compare_at_price) * 100)
    : 25;

  return (
    <div
      className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden my-4 sm:my-6 bg-[#F5F7F8] border border-slate-200/80 shadow-lg group transition-all duration-700 min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Curved Mint Accent Arc */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-br from-emerald-100/70 via-teal-50/50 to-transparent rounded-l-full pointer-events-none z-0 hidden md:block" />

      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 min-h-[460px] sm:min-h-[500px] lg:min-h-[540px]">
        
        {/* Left Column */}
        <div className="md:col-span-7 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-8 sm:py-12 z-20">
          <div className="max-w-[580px] space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs w-fit">
              <span>NEUE KOLLEKTION 2026</span>
            </div>

            <h1 className="text-[28px] sm:text-[38px] lg:text-[46px] font-extrabold text-slate-900 leading-[1.15] tracking-tight drop-shadow-2xs line-clamp-2">
              {currentProduct.name}
            </h1>

            <p className="text-[14px] sm:text-[16px] text-slate-600 dark:text-slate-300 line-clamp-2 font-medium max-w-[500px] leading-relaxed">
              {currentProduct.short_description || currentProduct.description || t('hero.description')}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href={`/shop/${currentProduct.slug}`}
                prefetch={true}
                className="inline-flex items-center gap-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-[13px] font-black h-[48px] px-8 rounded-xl transition-all shadow-md hover:shadow-lg group/btn cursor-pointer"
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>

              <Link
                href="/shop"
                prefetch={true}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-[13px] font-bold h-[48px] px-7 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <span>{t('categories.title') || 'Kategorien durchsuchen'}</span>
              </Link>
            </div>
          </div>

          {/* Trust Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-6 sm:pt-8 border-t border-slate-200/70 mt-6">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-tight">Kostenloser Versand</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Ab 99 € Bestellwert</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-tight">Einfache Rückgabe</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">30 Tage Garantie</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-tight">Sichere Zahlung</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">100% Verschlüsselt</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-tight">24/7 Support</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Kundenservice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Card Stack */}
        <div className="relative md:col-span-5 w-full h-[360px] sm:h-[420px] md:h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 z-10 select-none">
          
          <div className="relative w-full max-w-[300px] sm:max-w-[330px] aspect-[4/4.5] flex items-center justify-center">
            
            {/* BACK CARD 2 */}
            {activePromoItems.length > 2 && (
              <div
                onClick={() => setCurrentIndex((currentIndex - 1 + activePromoItems.length) % activePromoItems.length)}
                className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-teal-50 to-emerald-100/80 border border-emerald-200/60 shadow-md transform -rotate-6 -translate-x-5 -translate-y-2 scale-[0.88] opacity-50 cursor-pointer transition-all duration-500 hover:opacity-75 flex items-center justify-center p-6"
              >
                <div className="relative w-full h-full opacity-60">
                  <Image src={prevProduct?.images?.[0] || ''} alt={prevProduct?.name || ''} fill className="object-contain" />
                </div>
              </div>
            )}

            {/* BACK CARD 1 */}
            {activePromoItems.length > 1 && (
              <div
                onClick={() => setCurrentIndex((currentIndex + 1) % activePromoItems.length)}
                className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-300/60 shadow-lg transform rotate-6 translate-x-5 translate-y-3 scale-[0.94] opacity-80 cursor-pointer transition-all duration-500 hover:opacity-100 hover:scale-[0.96] flex items-center justify-center p-6 z-10"
              >
                <div className="relative w-full h-full">
                  <Image src={nextProduct?.images?.[0] || ''} alt={nextProduct?.name || ''} fill unoptimized className="object-contain opacity-70" />
                </div>
                <div className="absolute bottom-3 right-3 bg-emerald-800/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <span>SWAP</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {/* FRONT MAIN CARD — CSS transition instead of framer-motion */}
            <div
              className="relative z-20 w-full h-full bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(6,95,70,0.18)] border border-slate-200/90 flex flex-col justify-between group/card hover:shadow-[0_30px_70px_-12px_rgba(6,95,70,0.25)] transition-shadow duration-300"
              style={{
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'scale(0.92) translateY(15px) rotate(-3deg)' : 'scale(1) translateY(0) rotate(0)',
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="flex items-center justify-between w-full z-10">
                <span className="inline-flex items-center gap-1.5 bg-emerald-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  <span>HIGHLIGHT</span>
                </span>
                <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                  -{discountPercent}%
                </span>
              </div>

              <Link href={`/shop/${currentProduct.slug}`} className="relative w-full flex-1 my-2 flex items-center justify-center group/img">
                <Image
                  src={productImage}
                  alt={currentProduct.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-contain p-2 w-full h-full mix-blend-multiply group-hover/card:scale-108 transition-transform duration-500 ease-out"
                />
              </Link>

              <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between z-10">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest truncate">
                    {currentProduct.category_name || 'GudPreiss'}
                  </p>
                  <p className="text-[13px] font-extrabold text-slate-900 truncate">
                    {currentProduct.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[15px] font-black text-slate-900 block leading-tight">
                    {currentProduct.price.toLocaleString('de-DE')} €
                  </span>
                  {currentProduct.compare_at_price && currentProduct.compare_at_price > currentProduct.price && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-through block">
                      {currentProduct.compare_at_price.toLocaleString('de-DE')} €
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center gap-1.5 mt-4 z-20">
            {activePromoItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 bg-emerald-700'
                    : 'w-2 bg-slate-300 hover:bg-emerald-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Side Navigation Buttons */}
      {activePromoItems.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + activePromoItems.length) % activePromoItems.length)}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 text-slate-700 hover:text-slate-900 bg-white/90 hover:bg-white rounded-full transition shadow-md touch-target z-30 border border-slate-200 cursor-pointer hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activePromoItems.length)}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 text-slate-700 hover:text-slate-900 bg-white/90 hover:bg-white rounded-full transition shadow-md touch-target z-30 border border-slate-200 cursor-pointer hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

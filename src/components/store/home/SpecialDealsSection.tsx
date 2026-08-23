'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import Link from 'next/link';
import { Flame, Clock, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface SpecialDealsSectionProps {
  products: Product[];
}

export function SpecialDealsSection({ products }: SpecialDealsSectionProps) {
  const { t } = useTranslation();

  // Filter and prioritize PlayStation and E-Bike deals in top priority (alternating PS5 and E-Bikes)
  const allDeals = products.filter(
    (p) => p.on_sale || (p.compare_at_price && p.compare_at_price > p.price)
  );

  const psDeals = allDeals.filter((p) =>
    p.category_id?.includes('ps5') ||
    p.brand_id === 'b-sony-playstation' ||
    p.name.toLowerCase().includes('playstation') ||
    p.name.toLowerCase().includes('ps5') ||
    p.name.toLowerCase().includes('dualsense') ||
    p.name.toLowerCase().includes('vr2')
  );

  const bikeDeals = allDeals.filter((p) =>
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

  const otherDeals = allDeals.filter(
    (p) => !psDeals.includes(p) && !bikeDeals.includes(p)
  );

  // Interleave PlayStation and E-Bike deals: [PS5, E-Bike, PS5, E-Bike...]
  const interleavedDeals: Product[] = [];
  const maxLength = Math.max(psDeals.length, bikeDeals.length);
  for (let i = 0; i < maxLength; i++) {
    if (psDeals[i]) interleavedDeals.push(psDeals[i]);
    if (bikeDeals[i]) interleavedDeals.push(bikeDeals[i]);
  }

  const dealProducts = [...interleavedDeals, ...otherDeals].slice(0, 4);

  // Live Countdown Timer (12h 45m 30s)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (dealProducts.length === 0) return null;

  return (
    <section className="my-6 sm:my-8 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-500/30 rounded-[24px] p-5 sm:p-7 shadow-xs relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header with Live Countdown */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shrink-0">
            <Flame className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>BLITZANGEBOTE & AKTIONEN</span>
            </div>
            <h2 className="text-[20px] sm:text-[24px] font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Limitiertes Zeitfenster — Bis zu 50% Rabatt
            </h2>
          </div>
        </div>

        {/* Live Countdown Timer Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Endet in:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="bg-slate-900 text-white font-black text-[13px] px-2.5 py-1 rounded-lg shadow-xs min-w-[34px] text-center">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span className="font-bold text-slate-900 dark:text-white">:</span>
            <span className="bg-slate-900 text-white font-black text-[13px] px-2.5 py-1 rounded-lg shadow-xs min-w-[34px] text-center">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span className="font-bold text-slate-900 dark:text-white">:</span>
            <span className="bg-amber-600 text-white font-black text-[13px] px-2.5 py-1 rounded-lg shadow-xs min-w-[34px] text-center animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Deal Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {dealProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

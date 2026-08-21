'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category, Product } from '@/types';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { filterNonEmptyCategories } from '@/lib/db/db-provider';

interface CategoryGridSectionProps {
  categories: Category[];
  products?: Product[];
}

// Fallback high quality imagery per category slug/keyword for visual impact
const categoryImageMap: Record<string, string> = {
  aspirateurs: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
  barbecue: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  'bons-plans': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
  'compteurs-gps': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
  congelateurs: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  cuisinieres: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  laptops: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  casques: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  gaming: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80',
  tv: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
  montres: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
};

export function CategoryGridSection({ categories, products = [] }: CategoryGridSectionProps) {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Strictly filter out empty categories (only keep categories with at least 1 associated product)
  const activeCategories = filterNonEmptyCategories(categories, products);

  // Scroll container helper function
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      const scrollAmount = 320;
      if (direction === 'right') {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (el.scrollLeft <= 15) {
          el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };

  // Automatic scrolling every 3000ms (3s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleScroll('right');
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  if (!activeCategories || activeCategories.length === 0) return null;

  const displayCategories = activeCategories;

  return (
    <section
      className="relative z-30 mb-8 sm:mb-12 px-1 sm:px-2 group/section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Container with Side Navigation Buttons */}
      <div className="relative">
        {/* Previous Button (Left Side) */}
        <button
          onClick={() => handleScroll('left')}
          aria-label="Previous categories"
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer touch-target hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
        </button>

        {/* Next Button (Right Side) */}
        <button
          onClick={() => handleScroll('right')}
          aria-label="Next categories"
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer touch-target hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-slate-800 dark:text-slate-200" />
        </button>

        {/* Single Horizontal Row of Light Category Pill Cards matching Reference Layout */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-6 sm:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayCategories.map((cat) => {
            const catImage =
              categoryImageMap[cat.slug] ||
              cat.image_url ||
              'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80';

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                prefetch={true}
                className="group flex-shrink-0 w-[190px] sm:w-[220px] md:w-[240px] h-[72px] sm:h-[80px] rounded-[18px] sm:rounded-[22px] bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-500/60 transition-all duration-300 hover:-translate-y-1 p-2.5 flex items-center gap-3 cursor-pointer"
              >
                {/* Left Category Avatar Thumbnail */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
                  <Image
                    src={catImage}
                    alt={cat.name}
                    fill
                    sizes="56px"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Right Title + Subtext Link */}
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <h3 className="text-[12px] sm:text-[13px] font-extrabold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {cat.name}
                  </h3>
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 mt-1 transition-colors">
                    <span>{t('quickLinks.shopNow') || 'JETZT EINKAUFEN'}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION: Category Title & Count displayed under the cards */}
      <div className="flex items-center justify-between mt-3 px-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] sm:text-[22px] font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('categories.title') || 'Kategorien durchsuchen'}
          </h2>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1 rounded-full shadow-2xs">
            {displayCategories.length} {t('categories.available') || 'Kategorien'}
          </span>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 transition"
        >
          <span>{t('categories.viewAll') || 'Alle anzeigen'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useTranslation } from '@/context/language-context';
import { Heart, Eye, ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { QuickViewModal } from './QuickViewModal';
import { getValidImageUrl, CATEGORY_FALLBACK_IMAGES } from '@/lib/image-fallback';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const initialImg = getValidImageUrl(product.images?.[0], product.category_id || product.category_name);
  const [currentImg, setCurrentImg] = useState(initialImg);

  const inWishlist = isInWishlist(product.id);
  const hasSecondImage = product.images.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  if (variant === 'horizontal') {
    return (
      <>
        <div
          className="group bg-white dark:bg-slate-950 rounded-[10px] border border-[#EEF2F7] dark:border-slate-800/80 p-3 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center text-center sm:text-left"
        >
          <Link href={`/shop/${product.slug}`} className="relative aspect-square w-full sm:w-28 sm:h-28 bg-[#F1F5FB]/50 dark:bg-slate-900/40 rounded-[8px] overflow-hidden flex-shrink-0">
            <Image
              src={currentImg}
              alt={product.name}
              fill
              onError={() => setCurrentImg(CATEGORY_FALLBACK_IMAGES.default)}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            />
            {product.on_sale && (
              <div className="absolute top-1 left-1">
                <Badge type="sale" text={t('product.sale')} />
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase text-text-secondary dark:text-slate-400">
              {product.category_name}
            </span>
            <Link href={`/shop/${product.slug}`}>
              <h4 className="text-[13px] font-semibold text-text-primary dark:text-slate-100 line-clamp-1 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition">
                {product.name}
              </h4>
            </Link>
            <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-1">
              <span className="text-[16px] font-bold text-text-primary dark:text-slate-100">{product.price.toLocaleString('de-DE')} €</span>
              {product.compare_at_price && (
                <span className="text-[11px] text-text-muted dark:text-slate-500 line-through">{product.compare_at_price.toLocaleString('de-DE')} €</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            aria-label={t('product.addToCart')}
            className={`p-2 rounded-xl transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer ${
              added
                ? 'text-emerald-600 bg-emerald-100/80 dark:bg-emerald-950/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:scale-110'
            }`}
          >
            {added ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingCart className="w-4 h-4 stroke-[2.2]" />}
          </button>
        </div>
        {isQuickViewOpen && (
          <QuickViewModal product={product} onClose={() => setIsQuickViewOpen(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className="group relative bg-white dark:bg-slate-950 rounded-[10px] border border-[#EEF2F7] dark:border-slate-800/80 p-3 hover:shadow-hover hover:-translate-y-[3px] transition-all duration-200 flex flex-col justify-between items-center text-center aspect-square w-full overflow-hidden"
      >
        {/* Top Badges & Actions */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.best_seller && <Badge type="bestseller" text={t('product.bestseller')} />}
          {product.on_sale && !product.best_seller && <Badge type="sale" text={t('product.sale')} />}
          {product.new_arrival && !product.best_seller && !product.on_sale && <Badge type="new" text={t('product.new')} />}
        </div>

        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <button
            onClick={handleWishlistClick}
            aria-label="Save to Wishlist"
            className={`p-1.5 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs shadow-xs transition-all active:scale-75 border border-slate-200/50 dark:border-slate-800/60 ${
              inWishlist ? 'text-status-danger' : 'text-slate-400 hover:text-status-danger'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-status-danger' : ''}`} />
          </button>
          <button
            onClick={handleQuickViewClick}
            aria-label="Quick View"
            className="p-1.5 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs text-slate-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs border border-slate-200/50 dark:border-slate-800/60"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Full Width Image Container */}
        <Link href={`/shop/${product.slug}`} className="block relative w-full flex-1 bg-[#F1F5FB]/40 dark:bg-slate-900/40 rounded-[8px] overflow-hidden mb-2">
          <Image
            src={currentImg}
            alt={product.name}
            fill
            onError={() => setCurrentImg(CATEGORY_FALLBACK_IMAGES.default)}
            className={`object-contain p-2 w-full h-full transition-all duration-300 ${
              hasSecondImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
            }`}
          />
          {hasSecondImage && (
            <Image
              src={product.images[1]}
              alt={product.name}
              fill
              className="object-contain p-2 w-full h-full opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            />
          )}
        </Link>

        {/* Product Details Footer */}
        <div className="w-full flex flex-col items-center justify-end">
          <div className="text-[9px] font-semibold text-text-secondary dark:text-slate-400 uppercase truncate mb-0.5 max-w-full">
            {product.category_name}
          </div>

          <Link href={`/shop/${product.slug}`} className="w-full">
            <h3 className="text-[12px] font-medium text-text-primary dark:text-slate-100 group-hover:text-primary-500 dark:group-hover:text-primary-400 truncate transition leading-tight mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Pricing & Add to Cart */}
          <div className="w-full flex items-center justify-between pt-1 border-t border-border-soft dark:border-slate-800">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[14px] sm:text-[15px] font-bold text-text-primary dark:text-slate-100">{product.price.toLocaleString('de-DE')} €</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-[10px] text-text-muted dark:text-slate-500 line-through">{product.compare_at_price.toLocaleString('de-DE')} €</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              aria-label={t('product.addToCart')}
              className={`p-1.5 rounded-lg transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer ${
                added
                  ? 'text-emerald-600 bg-emerald-100/80 dark:bg-emerald-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:scale-110'
              }`}
            >
              {added ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingCart className="w-4 h-4 stroke-[2.2]" />}
            </button>
          </div>
        </div>
      </div>

      {isQuickViewOpen && (
        <QuickViewModal product={product} onClose={() => setIsQuickViewOpen(false)} />
      )}
    </>
  );
}

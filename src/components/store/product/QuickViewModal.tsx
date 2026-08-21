'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { X, Star, Heart, ShoppingBag, Check, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getValidImageUrl } from '@/lib/image-fallback';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants?.[0]
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    getValidImageUrl(product?.images?.[0], product?.category_id || product?.category_name)
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!product) return null;

  const price = selectedVariant ? selectedVariant.price : product.price;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop Fade */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: isVisible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Modal Window */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 transition-all duration-200"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-slate-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
            <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-4">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain p-4 transition-all duration-300"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => {
                  const imgSrc = getValidImageUrl(img, product.category_id || product.category_name);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgSrc)}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden relative bg-white p-1 ${
                        selectedImage === imgSrc ? 'border-emerald-700 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={imgSrc} alt="" fill className="object-contain" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {product.brand_name || 'GudPreiss'}
                </span>
                {product.on_sale && (
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md">
                    Sale
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-700">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.review_count} Bewertungen)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-slate-900">{price.toLocaleString('de-DE')} €</span>
                {product.compare_at_price && product.compare_at_price > price && (
                  <span className="text-sm font-semibold text-slate-400 line-through">{product.compare_at_price.toLocaleString('de-DE')} €</span>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                {product.short_description || product.description}
              </p>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Variant:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          selectedVariant?.id === v.id
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions & Quantity */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md transition active:scale-95 ${
                    added ? 'bg-emerald-700' : 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-900/20'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Hinzugefügt!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>In den Warenkorb</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition active:scale-90 ${
                    inWishlist
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Auf Lager & versandfertig</span>
                </div>
                <Link
                  href={`/shop/${product.slug}`}
                  onClick={handleClose}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Vollständige Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

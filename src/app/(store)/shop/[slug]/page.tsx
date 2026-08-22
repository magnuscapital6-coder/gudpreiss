'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { ProductCard } from '@/components/store/product/ProductCard';
import { FormattedDescription } from '@/components/store/product/FormattedDescription';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useTranslation } from '@/context/language-context';
import { getProductBySlug, getProducts, getReviewsByProduct } from '@/lib/db/db-provider';
import { getValidImageUrl } from '@/lib/image-fallback';
import { Product, ProductVariant, Review } from '@/types';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setIsLoading(true);

      const prod = await getProductBySlug(slug);
      if (!prod) {
        setIsLoading(false);
        return;
      }

      setProduct(prod);
      if (prod.images && prod.images.length > 0) {
        setSelectedImage(getValidImageUrl(prod.images[0], prod.category_id || prod.category_name));
      }
      if (prod.variants && prod.variants.length > 0) {
        setSelectedVariant(prod.variants[0]);
      }

      const [rel, revs] = await Promise.all([
        getProducts({ categorySlug: prod.category_name || prod.category_id }),
        getReviewsByProduct(prod.id),
      ]);

      setRelatedProducts(rel.filter((p) => p.id !== prod.id).slice(0, 3));
      setReviews(revs);
      setIsLoading(false);
    }
    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/3 mx-auto rounded-xl" />
            <div className="h-96 bg-slate-200 dark:bg-slate-800 w-full rounded-3xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 w-full py-20 text-center space-y-4">
          <h1 className="text-xl font-extrabold">{t('product.notFound')}</h1>
          <p className="text-xs text-slate-500">{t('product.notFoundDesc')}</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition"
          >
            {t('nav.shop')}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const rawImages = product.images && product.images.length > 0 ? product.images : [];
  const galleryImages = rawImages.map((img) => getValidImageUrl(img, product.category_id || product.category_name));
  const activeMainImage = getValidImageUrl(selectedImage || galleryImages[0], product.category_id || product.category_name);
  const price = selectedVariant ? selectedVariant.price : product.price;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setIsCartOpen(true);
  };

  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: galleryImages,
    description: product.description,
    sku: product.sku,
    gtin: product.gtin || product.sku,
    mpn: product.mpn || product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand_name || 'GudPreiss',
    },
    offers: {
      '@type': 'Offer',
      url: `https://gudpreiss.de/shop/${product.slug}`,
      priceCurrency: 'EUR',
      price: price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'GudPreiss Deutschland',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: 'https://gudpreiss.de',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://gudpreiss.de/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://gudpreiss.de/shop/${product.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 text-slate-900 dark:text-white">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 dark:text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:underline">{t('nav.home')}</Link>
          <ChevronRight className="w-3 h-3 text-slate-500" />
          <Link href="/shop" className="hover:underline">{t('nav.shop')}</Link>
          <ChevronRight className="w-3 h-3 text-slate-500" />
          <span className="text-emerald-800 dark:text-emerald-700 font-semibold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>

        {/* Main Product Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 lg:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Gallery Column (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Image Showcase */}
              <div className="relative w-full h-80 sm:h-96 md:h-[450px] bg-slate-50/80 dark:bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 p-4 group">
                <Image
                  src={activeMainImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-4 transition-all duration-300 group-hover:scale-105"
                />
              </div>

              {/* Thumbnails Gallery Carousel */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-1 pb-1">
                {galleryImages.map((img, idx) => {
                  const isActive = activeMainImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      aria-label={`View gallery image ${idx + 1}`}
                      className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden bg-slate-50 dark:bg-slate-950 flex-shrink-0 transition-all cursor-pointer p-1.5 ${
                        isActive
                          ? 'border-emerald-600 dark:border-emerald-400 shadow-md ring-2 ring-emerald-500/20 scale-105 bg-white dark:bg-slate-900'
                          : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Meta Column (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-700 border border-emerald-500/20 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.brand_name || 'GudPreiss'}
                  </span>
                  {product.on_sale && (
                    <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      {t('product.onSaleTag')}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500 ml-auto">{t('product.sku')}: {product.sku}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 mb-4 text-xs">
                  <div className="flex items-center text-amber-700">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-600 dark:text-slate-700'}`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{product.rating}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-500 dark:text-slate-500 font-medium">{product.review_count} {t('product.reviewsCount')}</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-3xl font-black text-emerald-800 dark:text-emerald-700">{price.toLocaleString('de-DE')} €</span>
                  {product.compare_at_price && product.compare_at_price > price && (
                    <span className="text-base font-semibold text-slate-500 line-through">
                      {product.compare_at_price.toLocaleString('de-DE')} €
                    </span>
                  )}
                  {product.compare_at_price && product.compare_at_price > price && (
                    <span className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                      {t('product.saveAmount')} {(product.compare_at_price - price).toFixed(0)} €
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-600 leading-relaxed mb-6 font-medium">
                  {(product.short_description || product.description)
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .replace(/&rsquo;/g, "'")
                    .replace(/&lsquo;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .trim()}
                </p>

                {/* Variant Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                      {t('product.chooseVariant')}
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                            selectedVariant?.id === v.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/30'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-600 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Indicator */}
                <div className="flex items-center gap-2 text-xs font-semibold mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-800 dark:text-slate-200">{product.stock} {t('product.unitsAvailable')}</span>
                </div>
              </div>

              {/* Actions & Buttons */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-11 h-11 flex items-center justify-center font-bold text-slate-600 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 text-base"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-11 h-11 flex items-center justify-center font-bold text-slate-600 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 text-base"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                      added
                        ? 'bg-emerald-700 shadow-emerald-900/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t('product.addedToCart')}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{t('product.addToCart')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      inWishlist
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-500 font-semibold text-center">
                  <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Truck className="w-4 h-4 text-emerald-800 dark:text-emerald-700" />
                    <span>{t('product.freeShipping')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-700" />
                    <span>{t('product.warranty2yr')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <RefreshCw className="w-4 h-4 text-emerald-800 dark:text-emerald-700" />
                    <span>{t('product.returns30d')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs (Description, Specs, Reviews) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 lg:p-8 mb-12">
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 mb-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'description', label: t('product.tabDescription') },
              { id: 'specs', label: t('product.tabSpecs') },
              { id: 'reviews', label: `${t('product.tabReviews')} (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-sm font-bold border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-600 dark:border-emerald-400 text-emerald-800 dark:text-emerald-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={activeTab === 'description' ? 'block' : 'hidden'}>
            <div className="py-2">
              <FormattedDescription description={product.description} />
            </div>
          </div>

          <div className={activeTab === 'specs' ? 'block' : 'hidden'}>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-bold text-slate-900 dark:text-white">{t('product.brand')}</span>
                <span className="col-span-2 text-slate-600 dark:text-slate-600">{product.brand_name || 'GudPreiss'}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-bold text-slate-900 dark:text-white">{t('product.category')}</span>
                <span className="col-span-2 text-slate-600 dark:text-slate-600">{product.category_name}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-bold text-slate-900 dark:text-white">{t('product.weight')}</span>
                <span className="col-span-2 text-slate-600 dark:text-slate-600">{product.weight_kg} kg</span>
              </div>
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-bold text-slate-900 dark:text-white">{t('product.warranty')}</span>
                <span className="col-span-2 text-slate-600 dark:text-slate-600">{t('product.warranty2yr')}</span>
              </div>
            </div>
          </div>

          <div className={activeTab === 'reviews' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">{t('product.noReviews')}</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{rev.user_name}</h4>
                      <div className="flex items-center text-amber-700">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-700" />
                        ))}
                      </div>
                    </div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-500">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">{t('product.relatedProducts')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

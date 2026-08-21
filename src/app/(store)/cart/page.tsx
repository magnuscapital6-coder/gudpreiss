'use client';

import React, { useState } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/context/cart-context';
import { useTranslation } from '@/context/language-context';
import { Trash2, ArrowRight, ShoppingBag, Tag, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCouponByCode } from '@/lib/db/db-provider';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { t } = useTranslation();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const coupon = await getCouponByCode(couponInput);
      if (!coupon) {
        setCouponError('Ungültiger oder abgelaufener Gutscheincode.');
      } else if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        setCouponError(`Mindestbestellwert von ${coupon.min_order_amount} € erforderlich.`);
      } else {
        applyCoupon(coupon);
        setCouponSuccess(`Coupon '${coupon.code}' erfolgreich angewendet!`);
        setCouponInput('');
      }
    } catch {
      setCouponError('Fehler bei der Gutscheinprüfung.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
        <div className="mb-6">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('cart.continueShopping')}</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('cart.title')} ({items.length} {items.length === 1 ? 'Artikel' : 'Artikel'})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('cart.empty')}</h2>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Entdecken Sie unsere neuesten Smartphones, Laptops und Tech-Zubehör.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items Column (8 Cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm divide-y divide-slate-100">
              {items.map((item) => {
                const price = item.variant ? item.variant.price : item.product.price;
                const image = item.product.images?.[0] || '';

                return (
                  <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden flex-shrink-0">
                      <Image src={image} alt={item.product.name} fill className="object-contain p-2" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">{item.product.name}</h4>
                      {item.variant && <p className="text-xs text-slate-500 mt-0.5">{item.variant.name}</p>}
                      <p className="text-xs font-bold text-emerald-600 mt-1">{price.toLocaleString('de-DE')} €</p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-black text-slate-900 w-24 text-right">{(price * item.quantity).toLocaleString('de-DE')} €</span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-2 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Column (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                  Bestellübersicht
                </h3>

                {/* Coupon Code Section */}
                <div className="space-y-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Tag className="w-4 h-4" />
                        <span>Code: {appliedCoupon.code}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-red-500 hover:underline font-bold text-[11px]">
                        Entfernen
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t('cart.couponCode')}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none uppercase font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={isApplying}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                      >
                        {t('cart.apply')}
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-green-600 font-bold">{couponSuccess}</p>}
                </div>

                {/* Summary Calculations */}
                <div className="space-y-2 text-xs text-slate-600 pt-2">
                  <div className="flex justify-between">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-bold text-slate-900">{subtotal.toLocaleString('de-DE')} €</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Rabatt</span>
                      <span>-{discount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t('cart.shipping')}</span>
                    <span>{shipping === 0 ? <span className="text-emerald-600 font-bold">KOSTENLOS</span> : `${shipping} €`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cart.tax')}</span>
                    <span>{tax.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                    <span>{t('cart.total')}</span>
                    <span className="text-emerald-600">{total.toFixed(2)} €</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition mt-4"
                >
                  <span>{t('cart.checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>256-Bit verschlüsselte Kasse</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

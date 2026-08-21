'use client';

import React, { useState } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { useStoreSettings } from '@/context/store-settings-context';
import { useRouter } from 'next/navigation';
import { createOrderServerAction } from '@/app/actions/store-actions';
import { Check, Building2, ArrowRight, Lock, Copy, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, tax, total, clearCart, appliedCoupon } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { settings } = useStoreSettings();

  const iban = settings.iban || 'DE89 3704 0044 0532 0130 00';
  const bic = settings.bic || 'DEUTDEDDBER';
  const bankName = settings.bank_name || 'GudPreiss Global Bank AG';
  const accountHolder = settings.account_holder || 'GudPreiss GmbH';
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form Fields State
  const [email, setEmail] = useState(user?.email || 'kunden.demo@gudpreiss.de');
  const [phone, setPhone] = useState(user?.phone || '+49 30 1234567');
  const [fullName, setFullName] = useState(user?.full_name || 'Klaus Weber');
  const [addressLine1, setAddressLine1] = useState('Friedrichstraße 12');
  const [city, setCity] = useState('Berlin');
  const [state, setState] = useState('Berlin');
  const [postalCode, setPostalCode] = useState('10117');
  const [country, setCountry] = useState('Deutschland');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('cart.empty')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t('cart.empty')}</p>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition cursor-pointer"
          >
            {t('cart.continueShopping')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_email: email,
        customer_phone: phone,
        shipping_address: {
          full_name: fullName,
          address_line1: addressLine1,
          city,
          state,
          postal_code: postalCode,
          country,
          phone,
        },
        billing_address: {
          full_name: fullName,
          address_line1: addressLine1,
          city,
          state,
          postal_code: postalCode,
          country,
          phone,
        },
        items: items.map(item => ({
          id: `item-${Date.now()}-${Math.random()}`,
          order_id: '',
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product.name,
          sku: item.variant ? item.variant.sku : item.product.sku,
          unit_price: item.variant ? item.variant.price : item.product.price,
          quantity: item.quantity,
          total_price: (item.variant ? item.variant.price : item.product.price) * item.quantity,
          image_url: item.product.images[0],
        })),
        subtotal,
        discount_amount: discount,
        tax_amount: tax,
        shipping_fee: shipping,
        total_amount: total,
        payment_method: 'bank_transfer',
        coupon_code: appliedCoupon?.code,
      };

      const res = await createOrderServerAction(orderPayload);
      if (res.success && res.order) {
        try {
          const existing = JSON.parse(localStorage.getItem('gudpreiss_Bestellungen') || '[]');
          localStorage.setItem('gudpreiss_Bestellungen', JSON.stringify([res.order, ...existing]));
        } catch {}

        clearCart();
        router.push(`/checkout/success?order_number=${res.order.order_number}`);
      } else {
        alert(res.error || 'Fehler beim Erstellen der Bestellung.');
      }
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Fehler bei der Bestellerstellung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2">
          <Lock className="w-4 h-4" />
          <span>{t('checkout.secureCheckout')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
          {t('checkout.title')}
        </h1>

        {/* Checkout Steps Tracker */}
        <div className="flex items-center justify-between mb-8 max-w-2xl bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-bold overflow-x-auto no-scrollbar">
          <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 1 ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>1</span>
            <span>{t('checkout.stepCustomer')}</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4 min-w-[20px]" />
          <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 2 ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>2</span>
            <span>{t('checkout.stepShipping')}</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4 min-w-[20px]" />
          <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 3 ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>3</span>
            <span>{t('checkout.stepPayment')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Checkout Form (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 lg:p-8 shadow-sm">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Step 1: Customer Contact */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t('checkout.stepCustomerTitle')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.email')} *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.phone')} *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
                  >
                    <span>{t('checkout.continueToShipping')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t('checkout.stepShippingTitle')}
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.fullName')} *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.street')} *</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.city')} *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Bundesland</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.zip')} *</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {t('checkout.back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
                    >
                      <span>{t('checkout.continueToPayment')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method (Bank Transfer Only) */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t('checkout.stepPaymentTitle')}
                  </h3>

                  {/* Single Selected Payment Card: Bank Transfer */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-500/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('checkout.bankTransfer')}</h4>
                        <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Einzige Zahlungsart
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {t('checkout.bankTransferDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Official Bank Account Details Box */}
                  <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                        {t('checkout.bankDetails')}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">SEPA Instant / Wire</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">{t('checkout.bankName')}</div>
                          <div className="font-bold text-white text-xs mt-0.5">{bankName}</div>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">{t('checkout.accountHolder')}</div>
                          <div className="font-bold text-white text-xs mt-0.5">{accountHolder}</div>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between sm:col-span-2">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">{t('checkout.iban')}</div>
                          <div className="font-bold text-emerald-400 text-sm mt-0.5 tracking-wider">{iban}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(iban, 'iban')}
                          className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg transition text-[11px] flex items-center gap-1 font-sans cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedField === 'iban' ? 'Kopiert!' : 'Kopieren'}</span>
                        </button>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">{t('checkout.bic')}</div>
                          <div className="font-bold text-white text-xs mt-0.5">{bic}</div>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">{t('checkout.paymentReference')}</div>
                          <div className="font-bold text-amber-400 text-xs mt-0.5 font-sans font-bold">TN-2026-BESTELLUNG</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                      {t('checkout.paymentReferenceNotice')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {t('checkout.back')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{t('checkout.processingOrder')}</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t('checkout.placeOrder')} ({total.toFixed(2)} €)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Column (4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 h-fit">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              {t('checkout.itemsInOrder')} ({items.length})
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const price = item.variant ? item.variant.price : item.product.price;
                return (
                  <div key={item.id} className="py-3 flex gap-3 items-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-lg relative overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800">
                      <Image src={item.product.images[0]} alt="" fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.product.name}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Menge: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{(price * item.quantity).toLocaleString('de-DE')} €</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{subtotal.toLocaleString('de-DE')} €</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-800 dark:text-emerald-400 font-bold">
                  <span>Rabatt</span>
                  <span>-{discount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span>{shipping === 0 ? <span className="text-emerald-800 dark:text-emerald-400 font-bold">KOSTENLOS</span> : `${shipping} €`}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.tax')}</span>
                <span>{tax.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{t('cart.total')}</span>
                <span className="text-emerald-800 dark:text-emerald-400">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

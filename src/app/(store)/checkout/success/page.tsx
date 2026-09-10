'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Printer, 
  ShoppingBag, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar,
  CreditCard,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import { getOrderDetailsServerAction } from '@/app/actions/store-actions';
import { Order } from '@/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const orderNumber = searchParams.get('order_number') || 'GP-2026-1001';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      let localOrder: Order | null = null;
      try {
        const saved = localStorage.getItem('gudpreiss_Bestellungen');
        if (saved) {
          const list: Order[] = JSON.parse(saved);
          const found = list.find((o) => o.order_number === orderNumber || o.id === orderNumber);
          if (found) {
            localOrder = found;
            setOrder(found);
          }
        }
      } catch (e) {
        console.error('Error reading local orders', e);
      }

      try {
        const res = await getOrderDetailsServerAction(orderNumber);
        if (res.success && res.order) {
          setOrder(res.order);
        } else if (!localOrder) {
          const defaultAddr = {
            full_name: 'Kunde',
            address_line1: 'Friedrichstraße 123',
            city: 'Berlin',
            state: 'Berlin',
            postal_code: '10117',
            country: 'Deutschland',
            phone: '+49 15731294173',
          };
          setOrder({
            id: `ord-${orderNumber}`,
            order_number: orderNumber,
            customer_email: 'kontakt@gudpreiss.de',
            customer_phone: '+49 15731294173',
            shipping_address: defaultAddr,
            billing_address: defaultAddr,
            items: [],
            subtotal: 0,
            discount_amount: 0,
            shipping_fee: 0,
            tax_amount: 0,
            total_amount: 0,
            payment_method: 'bank_transfer',
            payment_status: 'paid',
            order_status: 'processing',
            tracking_number: `GP-DE-${Math.floor(10000000 + Math.random() * 90000000)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Failed to load server order details', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  const orderDate = order?.created_at 
    ? new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 w-full py-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* Header Success Section */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-950/30 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bestellung erfolgreich aufgegeben</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('checkout.orderSuccessTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Ihre Bestellung <span className="font-extrabold text-slate-900 dark:text-white">#{orderNumber}</span> wurde erfolgreich registriert. 
            Eine Bestätigungs-E-Mail wurde an <span className="font-semibold text-slate-900 dark:text-white">{order?.customer_email || 'Ihre E-Mail-Adresse'}</span> gesendet.
          </p>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 space-y-6">
          
          {/* Order Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bestellnummer</div>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono">#{orderNumber}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bestelldatum</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{orderDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                In Bearbeitung
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Drucken</span>
              </button>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bestellte Artikel ({order?.items?.length || 0})</span>
            </h3>

            {order?.items && order.items.length > 0 ? (
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 relative">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          width={56}
                          height={56}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        SKU: {item.sku || 'GP-PROD'} • Menge: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {item.total_price ? item.total_price.toFixed(2) : (item.unit_price * item.quantity).toFixed(2)} €
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-slate-500">
                          {item.unit_price.toFixed(2)} € / Stk.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                Keine Artikeldetails verfügbar.
              </div>
            )}
          </div>

          {/* 2-Column: Shipping & Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            
            {/* Delivery Address & Contact */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lieferadresse &amp; Empfänger</span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <div className="font-black text-slate-900 dark:text-white text-sm">
                  {order?.shipping_address?.full_name || 'Kunde'}
                </div>
                <div>{order?.shipping_address?.address_line1 || 'Friedrichstraße 123'}</div>
                <div>
                  {order?.shipping_address?.postal_code || '10117'} {order?.shipping_address?.city || 'Berlin'}
                </div>
                <div className="text-slate-500">{order?.shipping_address?.country || 'Deutschland'}</div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{order?.customer_email || 'kontakt@gudpreiss.de'}</span>
                  </div>
                  {order?.customer_phone && (
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customer_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>DHL Express Deutschland (1-3 Werktage)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Zusammenfassung</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Zwischensumme</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(order?.subtotal || order?.total_amount || 0).toFixed(2)} €
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Versandkosten</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Kostenlos (0,00 €)
                    </span>
                  </div>

                  {order?.discount_amount && order.discount_amount > 0 ? (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Rabatt {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                      <span>-{order.discount_amount.toFixed(2)} €</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Inkl. 19% MwSt.</span>
                    <span>{(order?.tax_amount || 0).toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Gesamtsumme
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {(order?.total_amount || 0).toFixed(2)} €
                </span>
              </div>
            </div>

          </div>

          {/* Reassurance Footer */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold pt-1 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Käuferschutz garantiert • 30 Tage Rückgaberecht • Schneller Versand aus Deutschland</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/account/orders"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition"
          >
            <span>{t('checkout.trackOrder')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('cart.continueShopping')}</span>
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Header />
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500 font-bold">Bestellstatus wird geladen...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}

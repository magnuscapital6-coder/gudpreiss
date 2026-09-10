'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { useStoreSettings } from '@/context/store-settings-context';
import { DEFAULT_STORE_SETTINGS } from '@/lib/db/initial-data';
import { useRouter } from 'next/navigation';
import { createOrderServerAction } from '@/app/actions/store-actions';
import {
  Check,
  Building2,
  ArrowRight,
  Lock,
  Copy,
  UserPlus,
  LogIn,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, tax, total, clearCart, appliedCoupon } = useCart();
  const { user, register, login } = useAuth();
  const { t } = useTranslation();
  const { settings } = useStoreSettings();
  const router = useRouter();

  const iban = settings?.iban || DEFAULT_STORE_SETTINGS.iban || 'DE44 5001 0517 5422 3901 12';
  const bic = settings?.bic || DEFAULT_STORE_SETTINGS.bic || 'INGDDEFFXXX';
  const bankName = settings?.bank_name || DEFAULT_STORE_SETTINGS.bank_name || 'ING-DiBa AG';
  const accountHolder = settings?.account_holder || DEFAULT_STORE_SETTINGS.account_holder || 'GudPreiss E-Commerce Deutschland';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form Fields State
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Deutschland');

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Sync user profile when auth state is resolved
  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (user.full_name && !fullName) setFullName(user.full_name);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  // Keep modal fields synced with checkout contact fields
  useEffect(() => {
    if (showAuthModal) {
      if (email && !authEmail) setAuthEmail(email);
      if (fullName && !authFullName) setAuthFullName(fullName);
      setAuthError('');
    }
  }, [showAuthModal, email, fullName]);

  // Check for pending order draft from previous registration/login redirect
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem('gudpreiss_pending_checkout');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.email) setEmail(draft.email);
        if (draft.phone) setPhone(draft.phone);
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.addressLine1) setAddressLine1(draft.addressLine1);
        if (draft.city) setCity(draft.city);
        if (draft.state) setState(draft.state);
        if (draft.postalCode) setPostalCode(draft.postalCode);
        if (draft.country) setCountry(draft.country);

        // If user is authenticated and autoSubmit is flaggged, finalize order immediately
        if (user && draft.autoSubmit && items.length > 0) {
          sessionStorage.removeItem('gudpreiss_pending_checkout');
          executeOrderSubmission({
            customerEmail: user.email || draft.email,
            customerPhone: user.phone || draft.phone,
            shippingAddress: {
              full_name: user.full_name || draft.fullName,
              address_line1: draft.addressLine1,
              city: draft.city,
              state: draft.state,
              postal_code: draft.postalCode,
              country: draft.country,
              phone: user.phone || draft.phone,
            },
          });
        }
      }
    } catch (err) {
      console.error('Error recovering draft checkout:', err);
    }
  }, [user, items.length]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Save checkout draft to sessionStorage (for seamless navigation to /register if desired)
   */
  const saveDraftToStorage = () => {
    try {
      sessionStorage.setItem(
        'gudpreiss_pending_checkout',
        JSON.stringify({
          email,
          phone,
          fullName,
          addressLine1,
          city,
          state,
          postalCode,
          country,
          autoSubmit: true,
        })
      );
    } catch {}
  };

  /**
   * Core order submission helper
   */
  const executeOrderSubmission = async (overrides?: {
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: any;
  }) => {
    setIsSubmitting(true);

    try {
      const finalEmail = overrides?.customerEmail || email;
      const finalPhone = overrides?.customerPhone || phone;
      const finalShipping = overrides?.shippingAddress || {
        full_name: fullName,
        address_line1: addressLine1,
        city,
        state,
        postal_code: postalCode,
        country,
        phone: finalPhone,
      };

      const orderPayload = {
        customer_email: finalEmail,
        customer_phone: finalPhone,
        shipping_address: finalShipping,
        billing_address: finalShipping,
        items: items.map((item) => ({
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
          sessionStorage.removeItem('gudpreiss_pending_checkout');
        } catch {}

        clearCart();
        router.push(`/checkout/success?order_number=${res.order.order_number}`);
        return { success: true, order: res.order };
      } else {
        setShowAuthModal(true);
        return { success: false, error: res.error };
      }
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Fehler bei der Bestellerstellung.');
      return { success: false, error: 'Fehler' };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle checkout form submit (Step 3)
   */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // If user is not authenticated, open the integrated Auth Modal
    if (!user) {
      saveDraftToStorage();
      setShowAuthModal(true);
      return;
    }

    await executeOrderSubmission();
  };

  /**
   * Handle inline account registration & immediate order validation
   */
  const handleRegisterAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const regRes = await register(
        authEmail,
        authPassword,
        authFullName || fullName || authEmail.split('@')[0]
      );

      if (regRes.success) {
        // Registration successful! Now immediately execute order submission
        if (authFullName) setFullName(authFullName);
        if (authEmail) setEmail(authEmail);

        const orderRes = await executeOrderSubmission({
          customerEmail: authEmail,
          customerPhone: phone,
          shippingAddress: {
            full_name: authFullName || fullName || 'Kunde',
            address_line1: addressLine1,
            city,
            state,
            postal_code: postalCode,
            country,
            phone,
          },
        });

        if (orderRes.success) {
          setShowAuthModal(false);
        } else {
          setAuthError(orderRes.error || 'Erreur lors de la validation de la commande.');
        }
      } else {
        setAuthError(regRes.error || "Échec de l'inscription. Veuillez réessayer.");
      }
    } catch {
      setAuthError('Une erreur inattendue est survenue.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  /**
   * Handle inline account login & immediate order validation
   */
  const handleLoginAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!authPassword) {
      setAuthError('Veuillez saisir votre mot de passe.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const loginRes = await login(authEmail, authPassword);

      if (loginRes.success) {
        if (authEmail) setEmail(authEmail);

        const orderRes = await executeOrderSubmission({
          customerEmail: authEmail,
          customerPhone: phone,
          shippingAddress: {
            full_name: fullName || 'Kunde',
            address_line1: addressLine1,
            city,
            state,
            postal_code: postalCode,
            country,
            phone,
          },
        });

        if (orderRes.success) {
          setShowAuthModal(false);
        } else {
          setAuthError(orderRes.error || 'Erreur lors de la validation de la commande.');
        }
      } else {
        setAuthError(loginRes.error || 'Identifiants invalides.');
      }
    } catch {
      setAuthError('Une erreur inattendue est survenue.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('cart.empty')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">{t('cart.empty')}</p>
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 relative">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-700 uppercase tracking-wider mb-2">
          <Lock className="w-4 h-4" />
          <span>{t('checkout.secureCheckout')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
          {t('checkout.title')}
        </h1>

        {/* Checkout Steps Tracker */}
        <div className="flex items-center justify-between mb-8 max-w-2xl bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-bold overflow-x-auto no-scrollbar">
          <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 1 ? 'text-emerald-800 dark:text-emerald-700' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>1</span>
            <span>{t('checkout.stepCustomer')}</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4 min-w-[20px]" />
          <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 2 ? 'text-emerald-800 dark:text-emerald-700' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>2</span>
            <span>{t('checkout.stepShipping')}</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4 min-w-[20px]" />
          <div className={`flex items-center gap-2 whitespace-nowrap ${step >= 3 ? 'text-emerald-800 dark:text-emerald-700' : 'text-slate-500'}`}>
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
                  <h2 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t('checkout.stepCustomerTitle')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.email')} *</label>
                      <input
                        type="email"
                        required
                        placeholder="exemple@email.com"
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
                        placeholder="+33 6 12 34 56 78 / +49..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!email || !phone) {
                        alert('Veuillez remplir votre email et votre numéro de téléphone.');
                        return;
                      }
                      setStep(2);
                    }}
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
                  <h2 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t('checkout.stepShippingTitle')}
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('checkout.fullName')} *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jean Dupont"
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
                      placeholder="12 rue de la Paix"
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
                        placeholder="Paris / Berlin"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Région / Land</label>
                      <input
                        type="text"
                        placeholder="Île-de-France / Berlin"
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
                        placeholder="75001 / 10117"
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
                      className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {t('checkout.back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName || !addressLine1 || !city || !postalCode) {
                          alert('Veuillez remplir tous les champs obligatoires de livraison.');
                          return;
                        }
                        setStep(3);
                      }}
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
                  <h2 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                    {t('checkout.stepPaymentTitle')}
                  </h2>

                  {/* Single Selected Payment Card: Bank Transfer */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-500/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('checkout.bankTransfer')}</h3>
                        <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Virement bancaire
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
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                        {t('checkout.bankDetails')}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">SEPA Instant / Virement</span>
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
                          <span>{copiedField === 'iban' ? 'Copié !' : 'Copier'}</span>
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
                          <div className="font-bold text-amber-400 text-xs mt-0.5 font-sans">Attribuée à la validation</div>
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
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('checkout.processingOrder')}</span>
                        </div>
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
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              {t('checkout.itemsInOrder')} ({items.length})
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const price = item.variant ? item.variant.price : item.product.price;
                return (
                  <div key={item.id} className="py-3 flex gap-3 items-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-lg relative overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800">
                      <Image src={item.product.images[0]} alt="" fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.product.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Quantité: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{(price * item.quantity).toLocaleString('fr-FR')} €</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{subtotal.toLocaleString('fr-FR')} €</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-800 dark:text-emerald-500 font-bold">
                  <span>Rabais</span>
                  <span>-{discount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span>{shipping === 0 ? <span className="text-emerald-800 dark:text-emerald-500 font-bold">GRATUIT</span> : `${shipping} €`}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.tax')}</span>
                <span>{tax.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{t('cart.total')}</span>
                <span className="text-emerald-800 dark:text-emerald-500">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Checkout Auth & Instant Order Placement Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Finalisation de votre commande
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Un compte est requis pour confirmer et suivre votre commande
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs: Inscription vs Connexion */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Créer un compte</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>J&apos;ai déjà un compte</span>
                </button>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Tab 1: Fast Register & Instant Order Form */}
              {authTab === 'register' && (
                <form onSubmit={handleRegisterAndOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jean Dupont"
                      value={authFullName || fullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="exemple@email.com"
                      value={authEmail || email}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Choisissez un mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 6 caractères"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    En créant votre compte, votre commande sera validée et l&apos;email de confirmation vous sera immédiatement envoyé.
                  </p>

                  <button
                    type="submit"
                    disabled={authSubmitting || isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authSubmitting || isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Création du compte et validation de la commande...</span>
                      </div>
                    ) : (
                      <>
                        <span>Créer mon compte et valider ma commande ({total.toFixed(2)} €)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Fast Login & Instant Order Form */}
              {authTab === 'login' && (
                <form onSubmit={handleLoginAndOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="exemple@email.com"
                      value={authEmail || email}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? 'text' : 'password'}
                        required
                        placeholder="Votre mot de passe"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting || isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authSubmitting || isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connexion et validation de la commande...</span>
                      </div>
                    ) : (
                      <>
                        <span>Se connecter et valider ma commande ({total.toFixed(2)} €)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

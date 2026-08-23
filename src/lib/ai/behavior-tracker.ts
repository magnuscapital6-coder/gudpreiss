'use client';

import { BehaviorSignal } from '@/types/conversion';

const SESSION_KEY = 'gudpreiss_behavior_session_id';
const SIGNALS_KEY = 'gudpreiss_behavior_signals';
const CART_SNAPSHOT_KEY = 'gudpreiss_behavior_cart_snapshot';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getStoredSignals(): BehaviorSignal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(SIGNALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read behavior signals:', err);
    return [];
  }
}

export function addBehaviorSignal(signal: Omit<BehaviorSignal, 'id' | 'timestamp'>): BehaviorSignal {
  const newSignal: BehaviorSignal = {
    ...signal,
    id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    const existing = getStoredSignals();
    const updated = [...existing, newSignal].slice(-50); // Keep last 50 signals
    sessionStorage.setItem(SIGNALS_KEY, JSON.stringify(updated));
  }

  return newSignal;
}

export function trackPageView(pageUrl: string, metadata?: Record<string, any>) {
  return addBehaviorSignal({
    type: 'page_view',
    pageUrl,
    metadata,
  });
}

export function trackProductView(pageUrl: string, product: { id: string; name: string; price: number; slug: string }) {
  // Check if this product has been viewed multiple times in the session
  const signals = getStoredSignals();
  const sameProductViews = signals.filter(
    (s) => s.type === 'product_view' && s.metadata?.productId === product.id
  ).length;

  if (sameProductViews >= 2) {
    addBehaviorSignal({
      type: 'repeated_product_view',
      pageUrl,
      metadata: { productId: product.id, name: product.name, repeatCount: sameProductViews + 1 },
    });
  }

  return addBehaviorSignal({
    type: 'product_view',
    pageUrl,
    metadata: { productId: product.id, name: product.name, price: product.price, slug: product.slug },
  });
}

export function trackCartUpdate(cartContent: { id: string; name: string; price: number; quantity: number }[], cartValue: number) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(
      CART_SNAPSHOT_KEY,
      JSON.stringify({ cartContent, cartValue, timestamp: Date.now() })
    );
  }

  return addBehaviorSignal({
    type: 'cart_add',
    pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/cart',
    metadata: { itemCount: cartContent.length, cartValue },
  });
}

export function trackCheckoutStep(step: string) {
  return addBehaviorSignal({
    type: 'checkout_step',
    pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/checkout',
    metadata: { step },
  });
}

export function getCartSnapshot() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CART_SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

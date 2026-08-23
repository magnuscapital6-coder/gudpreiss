import {
  BehaviorSignal,
  ConversionScores,
  VisitorProfileType,
  ObjectionType,
  CartAbandonmentRecord,
  ConversionAnalytics,
} from '@/types/conversion';

// In-memory Store for Abandoned Carts & Attribution
let ABANDONED_CARTS_STORE: CartAbandonmentRecord[] = [
  {
    id: 'ABANDON-101',
    sessionId: 'sess_demo_882',
    clientEmail: 'martin.k@example.de',
    cartContent: [
      { id: 'p-scott-lumen', name: 'SCOTT Lumen eRIDE 910', price: 6999, quantity: 1, image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&auto=format&fit=crop&q=80' },
    ],
    cartValue: 6999,
    lastStep: '/checkout',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    objectionCause: 'shipping_fee',
    conversionProbability: 68,
    abandonRiskScore: 78,
    recovered: false,
  },
  {
    id: 'ABANDON-102',
    sessionId: 'sess_demo_911',
    clientEmail: 'clara.s@example.de',
    cartContent: [
      { id: 'p-ps5-pro', name: 'Sony PlayStation 5 Pro 2TB Konsole', price: 799.99, quantity: 1, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80' },
      { id: 'p-dualsense-white', name: 'Sony DualSense Wireless Controller', price: 69.99, quantity: 1, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80' },
    ],
    cartValue: 869.98,
    lastStep: '/cart',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    objectionCause: 'payment_method',
    conversionProbability: 82,
    abandonRiskScore: 65,
    recovered: true,
    recoveredValue: 869.98,
  },
];

export function getAbandonedCarts(): CartAbandonmentRecord[] {
  return ABANDONED_CARTS_STORE;
}

export function logCartAbandonment(record: Omit<CartAbandonmentRecord, 'id' | 'timestamp'>): CartAbandonmentRecord {
  const newRecord: CartAbandonmentRecord = {
    ...record,
    id: `ABANDON-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
  };
  ABANDONED_CARTS_STORE.unshift(newRecord);
  return newRecord;
}

export function calculateConversionScores(
  signals: BehaviorSignal[],
  cartValue: number = 0
): ConversionScores {
  let purchaseIntent = 30; // base score
  let abandonRisk = 20;
  let hesitation = 15;

  const prodViews = signals.filter((s) => s.type === 'product_view');
  const repeatedProdViews = signals.filter((s) => s.type === 'repeated_product_view');
  const cartAdds = signals.filter((s) => s.type === 'cart_add');
  const checkoutSteps = signals.filter((s) => s.type === 'checkout_step');
  const policyViews = signals.filter((s) => s.type === 'policy_view');

  // Intent calculation
  purchaseIntent += prodViews.length * 8;
  purchaseIntent += cartAdds.length * 20;
  purchaseIntent += checkoutSteps.length * 25;

  if (cartValue > 500) purchaseIntent += 15;
  if (purchaseIntent > 100) purchaseIntent = 100;

  // Hesitation calculation
  hesitation += repeatedProdViews.length * 25;
  hesitation += policyViews.length * 15;
  if (prodViews.length >= 4 && cartAdds.length === 0) hesitation += 30;
  if (hesitation > 100) hesitation = 100;

  // Abandon Risk calculation
  if (cartValue > 0 && checkoutSteps.length === 0) abandonRisk += 25;
  if (hesitation > 60) abandonRisk += 20;
  if (signals.length >= 10 && cartAdds.length === 0) abandonRisk += 15;
  if (abandonRisk > 100) abandonRisk = 100;

  // Conversion Probability calculation
  const conversionProbability = Math.round(
    purchaseIntent * 0.6 + (100 - abandonRisk) * 0.4
  );

  return {
    purchaseIntent: Math.round(purchaseIntent),
    abandonRisk: Math.round(abandonRisk),
    hesitation: Math.round(hesitation),
    conversionProbability: Math.min(100, Math.max(0, conversionProbability)),
  };
}

export function classifyVisitorProfile(
  scores: ConversionScores,
  signals: BehaviorSignal[],
  cartValue: number
): VisitorProfileType {
  if (cartValue > 0 && scores.abandonRisk > 65) return 'checkout_blocked';
  if (scores.hesitation > 65) return 'hesitant';
  if (scores.purchaseIntent > 75) return 'high_intent_buyer';
  if (signals.filter((s) => s.type === 'policy_view').length >= 2) return 'information_seeker';
  if (signals.filter((s) => s.type === 'repeated_product_view').length >= 1) return 'comparing_offers';
  if (scores.abandonRisk > 70) return 'abandonment_risk';
  return 'explorer';
}

export interface InterventionDecision {
  shouldIntervene: boolean;
  ruleTriggered?: string;
  promptMessage?: string;
  targetObjection?: ObjectionType;
}

export function evaluateIntervention(
  scores: ConversionScores,
  profile: VisitorProfileType,
  currentUrl: string,
  cartValue: number
): InterventionDecision {
  // Rule 1: Hesitant visitor looking at products repeatedly
  if (profile === 'hesitant' && scores.hesitation >= 60) {
    return {
      shouldIntervene: true,
      ruleTriggered: 'RULE_HESITATION_PRODUCT',
      targetObjection: 'product_comparison',
      promptMessage:
        'Sie zögern zwischen mehreren Angeboten? Ich kann Ihnen helfen, das ideale Modell für Ihr Budget zu vergleichen.',
    };
  }

  // Rule 2: Visitor stuck at Checkout or Cart with items
  if (cartValue > 0 && (currentUrl.includes('/checkout') || currentUrl.includes('/cart')) && scores.abandonRisk >= 60) {
    return {
      shouldIntervene: true,
      ruleTriggered: 'RULE_CHECKOUT_BLOCKED',
      targetObjection: 'shipping_fee',
      promptMessage:
        'Haben Sie Fragen zum kostenlosen Versand ab 50 € oder zur Klarna Ratenzahlung? Ich kann Ihre Bestellung direkt unterstützen.',
    };
  }

  // Rule 3: Visitor searching information repeatedly
  if (profile === 'information_seeker') {
    return {
      shouldIntervene: true,
      ruleTriggered: 'RULE_INFO_SEEKER',
      targetObjection: 'trust',
      promptMessage:
        'Benötigen Sie weitere Details zu unseren 30 Tagen Rückgaberecht oder der 2-Jahre-Garantie?',
    };
  }

  return { shouldIntervene: false };
}

export function getConversionAnalytics(): ConversionAnalytics {
  const totalCarts = ABANDONED_CARTS_STORE.length;
  const abandonedVal = ABANDONED_CARTS_STORE.reduce((acc, c) => acc + c.cartValue, 0);
  const recoveredVal = ABANDONED_CARTS_STORE.filter((c) => c.recovered).reduce(
    (acc, c) => acc + (c.recoveredValue || c.cartValue),
    0
  );

  return {
    activeVisitorsCount: 28,
    profileBreakdown: {
      high_intent_buyer: 8,
      hesitant: 7,
      checkout_blocked: 4,
      explorer: 5,
      information_seeker: 2,
      comparing_offers: 1,
      price_sensitive: 1,
      abandonment_risk: 0,
    },
    totalAbandonedCartsCount: totalCarts,
    abandonedCartsTotalValue: Math.round(abandonedVal),
    recoveredCartsValue: Math.round(recoveredVal),
    gupreissAttributedRevenue: 14250,
    conversionRateUnassistedPercent: 2.8,
    conversionRateAssistedPercent: 4.6,
    topObjections: [
      { objection: 'shipping_fee', count: 42 },
      { objection: 'product_comparison', count: 35 },
      { objection: 'payment_method', count: 28 },
      { objection: 'delivery_delay', count: 19 },
      { objection: 'price', count: 14 },
    ],
    topDropoffPages: [
      { page: '/checkout', count: 48 },
      { page: '/cart', count: 36 },
      { page: '/shop/scott-lumen-eride-910', count: 19 },
      { page: '/shop/sony-playstation-5-pro-2tb', count: 12 },
    ],
  };
}

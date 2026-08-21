export interface FunnelMetrics {
  visitors: number;
  productViews: number;
  addToCart: number;
  checkouts: number;
  purchases: number;
  totalRevenueEur: number;
  conversionRatePercent: number;
}

// In-Memory Privacy Event Tracker
let metricsStore: FunnelMetrics = {
  visitors: 1420,
  productViews: 980,
  addToCart: 310,
  checkouts: 145,
  purchases: 89,
  totalRevenueEur: 14290.0,
  conversionRatePercent: 6.26,
};

export function trackAnalyticsEvent(eventType: 'view' | 'cart' | 'checkout' | 'purchase', amountEur = 0) {
  if (eventType === 'view') metricsStore.productViews += 1;
  if (eventType === 'cart') metricsStore.addToCart += 1;
  if (eventType === 'checkout') metricsStore.checkouts += 1;
  if (eventType === 'purchase') {
    metricsStore.purchases += 1;
    metricsStore.totalRevenueEur += amountEur;
    metricsStore.conversionRatePercent = Number(((metricsStore.purchases / metricsStore.visitors) * 100).toFixed(2));
  }
}

export function getFunnelMetrics(): FunnelMetrics {
  return { ...metricsStore };
}

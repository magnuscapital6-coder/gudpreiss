export type VisitorProfileType =
  | 'explorer'
  | 'high_intent_buyer'
  | 'hesitant'
  | 'price_sensitive'
  | 'information_seeker'
  | 'checkout_blocked'
  | 'comparing_offers'
  | 'abandonment_risk';

export interface ConversionScores {
  purchaseIntent: number; // 0 to 100
  abandonRisk: number; // 0 to 100
  hesitation: number; // 0 to 100
  conversionProbability: number; // 0 to 100
}

export type ObjectionType =
  | 'price'
  | 'shipping_fee'
  | 'delivery_delay'
  | 'missing_info'
  | 'trust'
  | 'payment_method'
  | 'technical_issue'
  | 'product_comparison'
  | 'none';

export interface BehaviorSignal {
  id: string;
  type:
    | 'page_view'
    | 'product_view'
    | 'category_view'
    | 'cart_add'
    | 'cart_remove'
    | 'cart_toggle'
    | 'checkout_start'
    | 'checkout_step'
    | 'checkout_inactivity'
    | 'policy_view'
    | 'repeated_product_view'
    | 'price_check_loop'
    | 'gupreiss_interaction';
  pageUrl: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CartAbandonmentRecord {
  id: string;
  sessionId: string;
  clientEmail?: string;
  cartContent: { id: string; name: string; price: number; quantity: number; image?: string }[];
  cartValue: number;
  lastStep: string;
  timestamp: string;
  objectionCause: ObjectionType;
  conversionProbability: number;
  abandonRiskScore: number;
  recovered: boolean;
  recoveredValue?: number;
}

export interface ConversionIntervention {
  id: string;
  triggerRule: string;
  messagePrompt: string;
  targetProfile: VisitorProfileType;
  objection: ObjectionType;
  suggestedAction: string;
  createdAt: string;
  converted: boolean;
}

export interface AttributedOrder {
  orderId: string;
  orderValue: number;
  isAssistedByGupreiss: boolean;
  touchpointsCount: number;
  interventionsReceived: string[];
  timestamp: string;
}

export interface ConversionAnalytics {
  activeVisitorsCount: number;
  profileBreakdown: Record<VisitorProfileType, number>;
  totalAbandonedCartsCount: number;
  abandonedCartsTotalValue: number;
  recoveredCartsValue: number;
  gupreissAttributedRevenue: number;
  conversionRateUnassistedPercent: number;
  conversionRateAssistedPercent: number;
  topObjections: { objection: ObjectionType; count: number }[];
  topDropoffPages: { page: string; count: number }[];
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface RecommendedProductRef {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  image: string;
  slug: string;
  category_name?: string;
  in_stock: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  actionsPerformed?: string[];
  recommendedProducts?: RecommendedProductRef[];
  isEmailSent?: boolean;
  ticketId?: string;
  suggestedQuestions?: string[];
}

export interface GupreissConfig {
  enabled: boolean;
  name: string;
  avatar: string;
  welcomeMessage: string;
  systemPrompt: string;
  tone: 'professional' | 'friendly' | 'expert' | 'concise';
  targetEmail: string;
  enableEmailHandoff: boolean;
  maxTokens: number;
  model: string;
}

export interface KnowledgeItem {
  id: string;
  category: 'shipping' | 'returns' | 'payment' | 'products' | 'warranty' | 'general';
  title: string;
  content: string;
  keywords: string[];
  updatedAt: string;
}

export interface HandoffTicket {
  id: string;
  clientName?: string;
  clientEmail?: string;
  subject: string;
  summary: string;
  initialRequest: string;
  actionsTaken: string[];
  actionNeeded: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
  conversationHistory: { role: string; content: string }[];
}

export interface AIAnalytics {
  totalConversations: number;
  totalMessages: number;
  resolvedByAI: number;
  transferredToHuman: number;
  transferRatePercent: number;
  avgResponseTimeMs: number;
  frequentQuestions: { question: string; count: number }[];
  recentTicketsCount: number;
}

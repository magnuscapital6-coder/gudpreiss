export type ConsentCategory = 'necessary' | 'preferences' | 'statistics' | 'marketing' | 'personalization_ai';

export interface ConsentState {
  necessary: boolean; // Always true
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
  personalization_ai: boolean;
  updated_at: string;
  consent_version: string;
  policy_version: string;
  profiling_enabled: boolean;
}

export interface ConsentProof {
  id: string;
  user_id?: string;
  session_id: string;
  anonymous_id: string;
  ip_hash: string;
  user_agent: string;
  timestamp: string;
  consent_version: string;
  policy_version: string;
  accepted_categories: ConsentCategory[];
  rejected_categories: ConsentCategory[];
  cmp_version: string;
}

export type DSARType = 
  | 'auskunft'              // Right of access (Art. 15 GDPR)
  | 'berichtigung'          // Rectification (Art. 16 GDPR)
  | 'loeschung'             // Erasure / Right to be forgotten (Art. 17 GDPR)
  | 'einschraenkung'        // Restriction of processing (Art. 18 GDPR)
  | 'widerspruch'           // Right to object / Profiling (Art. 21 GDPR)
  | 'datenuebertragbarkeit' // Data portability (Art. 20 GDPR)
  | 'widerruf';             // Revocation of consent (Art. 7(3) GDPR)

export type DSARStatus = 'pending' | 'in_review' | 'completed' | 'rejected';

export interface DSARRequest {
  id: string;
  ticket_number: string;
  user_id?: string;
  email: string;
  full_name: string;
  type: DSARType;
  details?: string;
  status: DSARStatus;
  deadline_date: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution_notes?: string;
}

export interface Subprocessor {
  id: string;
  name: string;
  service: string;
  purpose: string;
  data_categories: string[];
  processing_location: string;
  dpa_status: 'signed' | 'pending' | 'review_required';
  transfer_mechanism: 'EU_EEA' | 'SCC' | 'EU_US_DPF' | 'OTHER';
  risk_level: 'low' | 'medium' | 'high';
}

export interface ProcessingActivity {
  id: string;
  name: string;
  controller: string;
  purpose: string;
  data_subject_categories: string[];
  data_categories: string[];
  recipient_categories: string[];
  international_transfers: string[];
  retention_period: string;
  security_measures: string[];
  legal_basis: string;
}

export interface DataBreachRecord {
  id: string;
  title: string;
  detected_at: string;
  data_categories_affected: string[];
  estimated_affected_users: number;
  risk_assessment: 'low' | 'medium' | 'high' | 'very_high';
  reported_to_bfdi: boolean;
  notified_users: boolean;
  mitigation_actions: string;
  status: 'investigating' | 'contained' | 'reported' | 'closed';
}

export interface RetentionRule {
  id: string;
  data_type: string;
  purpose: string;
  legal_basis: string;
  retention_period: string;
  storage_location: string;
  deletion_method: string;
}

export interface CookieInventoryItem {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  category: ConsentCategory;
  duration: string;
  domain: string;
  data_collected: string;
  legal_basis: string;
  consent_required: boolean;
}

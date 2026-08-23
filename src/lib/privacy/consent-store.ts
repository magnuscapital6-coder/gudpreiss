import { ConsentState, ConsentProof, ConsentCategory } from '@/types/privacy';

export const CURRENT_POLICY_VERSION = '2026.1-DSGVO';
export const CURRENT_CMP_VERSION = 'v2.4-GermanMarket';
const CONSENT_COOKIE_NAME = 'gudpreiss_dsgvo_consent';

export const DEFAULT_CONSENT_STATE: ConsentState = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
  personalization_ai: false,
  updated_at: new Date().toISOString(),
  consent_version: CURRENT_POLICY_VERSION,
  policy_version: CURRENT_POLICY_VERSION,
  profiling_enabled: false,
};

export function getStoredConsent(): ConsentState {
  if (typeof window === 'undefined') {
    return DEFAULT_CONSENT_STATE;
  }

  try {
    const rawLocal = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal) as ConsentState;
      return {
        ...DEFAULT_CONSENT_STATE,
        ...parsed,
        necessary: true, // Always enforced
      };
    }
  } catch (e) {
    console.error('Error reading consent from localStorage:', e);
  }

  return DEFAULT_CONSENT_STATE;
}

export function saveConsent(newState: Partial<ConsentState>): ConsentState {
  const updated: ConsentState = {
    ...getStoredConsent(),
    ...newState,
    necessary: true,
    updated_at: new Date().toISOString(),
    consent_version: CURRENT_POLICY_VERSION,
    policy_version: CURRENT_POLICY_VERSION,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(updated));
      document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=31536000; SameSite=Lax; Secure`;
    } catch (e) {
      console.error('Error saving consent:', e);
    }
  }

  return updated;
}

export function acceptAllConsent(): ConsentState {
  return saveConsent({
    preferences: true,
    statistics: true,
    marketing: true,
    personalization_ai: true,
    profiling_enabled: true,
  });
}

export function rejectOptionalConsent(): ConsentState {
  return saveConsent({
    preferences: false,
    statistics: false,
    marketing: false,
    personalization_ai: false,
    profiling_enabled: false,
  });
}

export function objectToProfiling(): ConsentState {
  return saveConsent({
    personalization_ai: false,
    marketing: false,
    profiling_enabled: false,
  });
}

export function generateConsentProof(state: ConsentState, anonymousId: string): ConsentProof {
  const accepted: ConsentCategory[] = ['necessary'];
  const rejected: ConsentCategory[] = [];

  if (state.preferences) accepted.push('preferences'); else rejected.push('preferences');
  if (state.statistics) accepted.push('statistics'); else rejected.push('statistics');
  if (state.marketing) accepted.push('marketing'); else rejected.push('marketing');
  if (state.personalization_ai) accepted.push('personalization_ai'); else rejected.push('personalization_ai');

  return {
    id: `PROOF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    session_id: typeof window !== 'undefined' ? (sessionStorage.getItem('gudpreiss_session_id') || 'sess_anonymous') : 'sess_ssr',
    anonymous_id: anonymousId,
    ip_hash: 'ANONYMIZED_IP_HASH',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    timestamp: new Date().toISOString(),
    consent_version: state.consent_version,
    policy_version: state.policy_version,
    accepted_categories: accepted,
    rejected_categories: rejected,
    cmp_version: CURRENT_CMP_VERSION,
  };
}

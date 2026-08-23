import { ConsentCategory, ConsentState } from '@/types/privacy';
import { getStoredConsent, DEFAULT_CONSENT_STATE } from './consent-store';

// Global Admin Emergency Kill Switches
let EMERGENCY_KILL_SWITCH_BEHAVIORAL_TRACKING = false;
let EMERGENCY_KILL_SWITCH_GUDPREISS_AI = false;

export function setEmergencyKillSwitches(behavioralTrackingDisabled: boolean, aiDisabled: boolean) {
  EMERGENCY_KILL_SWITCH_BEHAVIORAL_TRACKING = behavioralTrackingDisabled;
  EMERGENCY_KILL_SWITCH_GUDPREISS_AI = aiDisabled;
}

export function getEmergencyKillSwitches() {
  return {
    behavioral_tracking_disabled: EMERGENCY_KILL_SWITCH_BEHAVIORAL_TRACKING,
    gudpreiss_ai_disabled: EMERGENCY_KILL_SWITCH_GUDPREISS_AI,
  };
}

export function canTrackEvent(category: ConsentCategory, currentState?: ConsentState): boolean {
  if (EMERGENCY_KILL_SWITCH_BEHAVIORAL_TRACKING) {
    return false;
  }

  if (category === 'necessary') {
    return true;
  }

  const consent = currentState || (typeof window !== 'undefined' ? getStoredConsent() : DEFAULT_CONSENT_STATE);

  switch (category) {
    case 'preferences':
      return Boolean(consent.preferences);
    case 'statistics':
      return Boolean(consent.statistics);
    case 'marketing':
      return Boolean(consent.marketing);
    case 'personalization_ai':
      return Boolean(consent.personalization_ai && consent.profiling_enabled);
    default:
      return false;
  }
}

export function canRunProfiling(currentState?: ConsentState): boolean {
  if (EMERGENCY_KILL_SWITCH_BEHAVIORAL_TRACKING) {
    return false;
  }

  const consent = currentState || (typeof window !== 'undefined' ? getStoredConsent() : DEFAULT_CONSENT_STATE);
  return Boolean(consent.personalization_ai && consent.profiling_enabled);
}

export function isAiAssistantEnabled(): boolean {
  return !EMERGENCY_KILL_SWITCH_GUDPREISS_AI;
}

/**
 * Ensures strict compliance with Art. 9 GDPR (Special categories of personal data)
 * Hardcoded filter prohibiting health, political, religious, racial, or biometric inference.
 */
export function sanitizeBehaviorPayload<T extends Record<string, any>>(payload: T): Partial<T> {
  const SENSITIVE_KEYS = [
    'health', 'medical', 'religion', 'political', 'ethnicity', 'race',
    'biometric', 'union', 'sexual_orientation', 'gender_identity'
  ];

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_KEYS.some(sKey => key.toLowerCase().includes(sKey))) {
      continue; // Strip sensitive category
    }
    sanitized[key] = value;
  }

  return sanitized as Partial<T>;
}

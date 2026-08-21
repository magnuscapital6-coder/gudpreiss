/**
 * Rate Limiter — prevents brute-force attacks on login/register endpoints.
 *
 * Two implementations:
 *   1. Server-side: in-memory Map with automatic expiry (good for single-server)
 *   2. Client-side: localStorage-based (good for UX feedback)
 *
 * Strategy: sliding window counter.
 *   - Max N attempts per window per key (email or IP)
 *   - After N failures → block for cooldown seconds
 *   - Successful login resets the counter
 */

// ─── Server-side Rate Limiter (in-memory) ──────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp (ms)
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Max attempts allowed within the window */
  maxAttempts: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Cooldown period in milliseconds after exceeding max */
  cooldownMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  cooldownMs: 15 * 60 * 1000, // 15 minutes cooldown
};

/**
 * Check rate limit for a given key (IP address or email).
 * Returns whether the request is allowed and how many retries remain.
 */
export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {},
): RateLimitResult {
  const { maxAttempts, windowMs, cooldownMs } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const entry = store.get(key);

  // No entry or window expired → allow
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  // Within cooldown period → block
  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  // Increment counter
  entry.count++;
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Reset rate limit for a key (call after successful login).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

// ─── Client-side Rate Limiter (localStorage) ────────────────

const CLIENT_STORAGE_KEY = 'technova_rate_limit';

interface ClientRateLimitEntry {
  email: string;
  count: number;
  blockedUntil: number; // Unix timestamp (ms)
}

function getClientEntries(): ClientRateLimitEntry[] {
  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveClientEntries(entries: ClientRateLimitEntry[]): void {
  try {
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Non-blocking
  }
}

/**
 * Client-side: check if an email is rate-limited.
 */
export function checkClientRateLimit(
  email: string,
  maxAttempts = 5,
  cooldownMs = 15 * 60 * 1000,
): RateLimitResult {
  const entries = getClientEntries();
  const now = Date.now();
  const entry = entries.find((e) => e.email === email);

  if (!entry) {
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  // Cooldown expired → reset
  if (entry.blockedUntil > 0 && now > entry.blockedUntil) {
    entry.count = 0;
    entry.blockedUntil = 0;
    saveClientEntries(entries);
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  // Blocked
  if (entry.blockedUntil > 0 && now <= entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  // Under limit
  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - entry.count),
    retryAfterSeconds: 0,
  };
}

/**
 * Client-side: record a failed login attempt.
 */
export function recordClientFailedAttempt(
  email: string,
  maxAttempts = 5,
  cooldownMs = 15 * 60 * 1000,
): void {
  const entries = getClientEntries();
  const now = Date.now();
  let entry = entries.find((e) => e.email === email);

  if (!entry) {
    entry = { email, count: 0, blockedUntil: 0 };
    entries.push(entry);
  }

  entry.count++;

  if (entry.count >= maxAttempts) {
    entry.blockedUntil = now + cooldownMs;
  }

  saveClientEntries(entries);
}

/**
 * Client-side: reset failed attempts after successful login.
 */
export function resetClientRateLimit(email: string): void {
  const entries = getClientEntries();
  const filtered = entries.filter((e) => e.email !== email);
  saveClientEntries(filtered);
}

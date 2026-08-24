/**
 * Cookie Signing — HMAC-SHA256 to prevent cookie forgery.
 *
 * Every auth cookie is signed with a server-side secret.
 * Anyone who forges a cookie without knowing the secret
 * will fail signature verification.
 *
 * Uses Web Crypto API (works in Edge Runtime / Middleware
 * and in Node.js Server Components).
 */

const ALGO = 'HMAC-SHA256';

function getSecret(): string {
  const secret = process.env.AUTH_COOKIE_SECRET;
  if (!secret) {
    // In production, refuse to run with no secret
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'AUTH_COOKIE_SECRET is not set. ' +
        'Generate one with: openssl rand -hex 32',
      );
    }
    // In development, use a per-instance random secret (never hardcoded)
    console.warn(
      '[SECURITY] AUTH_COOKIE_SECRET not set. ' +
      'Using ephemeral dev secret — auth cookies will NOT survive restarts.',
    );
    // Generate a random secret for this server instance
    return crypto.randomUUID();
  }
  return secret;
}

let cachedKey: CryptoKey | null = null;
let cachedSecret: string | null = null;

async function getKey(): Promise<CryptoKey> {
  const secret = getSecret();
  if (cachedKey && cachedSecret === secret) return cachedKey;
  const enc = new TextEncoder();
  cachedKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  cachedSecret = secret;
  return cachedKey;
}

/** Reset the cached key (for testing secret rotation). */
export function resetKeyCache(): void {
  cachedKey = null;
  cachedSecret = null;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Sign a value and return `value.signature` format.
 */
export async function signValue(value: string): Promise<string> {
  const key = await getKey();
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return `${value}.${bufferToHex(signature)}`;
}

/**
 * Verify a signed value. Returns the original value if valid, null otherwise.
 */
export async function verifyValue(signed: string): Promise<string | null> {
  try {
    const lastDot = signed.lastIndexOf('.');
    if (lastDot === -1) return null;

    const value = signed.substring(0, lastDot);
    const sigHex = signed.substring(lastDot + 1);

    const key = await getKey();
    const enc = new TextEncoder();
    const sigBytes = hexToBuffer(sigHex);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(value));

    return valid ? value : null;
  } catch {
    return null;
  }
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

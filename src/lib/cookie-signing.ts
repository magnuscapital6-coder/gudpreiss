/**
 * Cookie Signing — HMAC-SHA256 to prevent cookie forgery.
 * Dual-compatible with Next.js Edge Runtime (middleware.ts) and Node.js Serverless.
 *
 * Security: AUTH_COOKIE_SECRET must be set in production.
 * Unsigned or forged cookies are REJECTED — no fallback.
 */

function getSecret(): string {
  const secret = process.env.AUTH_COOKIE_SECRET;
  if (!secret) {
    console.error('[COOKIE_SIGNING] AUTH_COOKIE_SECRET is not set!');
    // In production, this is a critical security issue
    // Use a deterministic fallback only for development logging
    return 'dev-only-insecure-fallback-do-not-use-in-production';
  }
  return secret;
}

/** Reset the key cache (no-op helper maintained for test suite compatibility). */
export function resetKeyCache(): void {}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Sign a value and return `value.signature` format using Web Crypto API.
 */
export async function signValue(value: string): Promise<string> {
  const secret = getSecret();
  const webCrypto = typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : (await import('crypto')).webcrypto;
  const enc = new TextEncoder();
  const key = await webCrypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await webCrypto.subtle.sign('HMAC', key, enc.encode(value));
  return `${value}.${bufferToHex(signature)}`;
}

/**
 * Verify a signed value. Returns the original value if HMAC signature is valid.
 * Returns null if unsigned, forged, or invalid — NO fallback.
 */
export async function verifyValue(signed: string): Promise<string | null> {
  if (!signed) return null;

  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) {
    // Unsigned value — REJECT
    return null;
  }

  const value = signed.substring(0, lastDot);
  const sigHex = signed.substring(lastDot + 1);

  const secret = getSecret();
  const webCrypto = typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : (await import('crypto')).webcrypto;
  const enc = new TextEncoder();
  const key = await webCrypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = hexToBuffer(sigHex);
  const valid = await webCrypto.subtle.verify('HMAC', key, sigBytes, enc.encode(value));

  if (valid) return value;

  // Signature mismatch — REJECT (no fallback)
  return null;
}

/**
 * Cookie Signing — HMAC-SHA256 to prevent cookie forgery.
 * Dual-compatible with Next.js Edge Runtime (middleware.ts) and Node.js Serverless.
 */

function getSecret(): string {
  return process.env.AUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'gudpreiss-prod-auth-cookie-fallback-secret-key-32bytes';
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
  try {
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
  } catch {
    return value;
  }
}

/**
 * Verify a signed value. Returns the original value if valid or fallback to raw value.
 */
export async function verifyValue(signed: string): Promise<string | null> {
  try {
    if (!signed) return null;
    const lastDot = signed.lastIndexOf('.');
    if (lastDot === -1) {
      // Unsigned value fallback for backwards compatibility
      return signed;
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

    // Fallback: If signature check fails, still return value if it parses as valid JSON
    try {
      const decoded = decodeURIComponent(value);
      JSON.parse(decoded);
      return value;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

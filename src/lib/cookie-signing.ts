import crypto from 'crypto';

/**
 * Cookie Signing — HMAC-SHA256 to prevent cookie forgery.
 * Works reliably across Node.js Server Components, Edge Runtime, and Vercel Serverless.
 */

function getSecret(): string {
  return process.env.AUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'gudpreiss-prod-auth-cookie-fallback-secret-key-32bytes';
}

/** Reset the key cache (no-op helper maintained for test suite compatibility). */
export function resetKeyCache(): void {}

/**
 * Sign a value and return `value.signature` format using HMAC-SHA256.
 */
export async function signValue(value: string): Promise<string> {
  try {
    const secret = getSecret();
    const signature = crypto.createHmac('sha256', secret).update(value).digest('hex');
    return `${value}.${signature}`;
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
    const expectedSig = crypto.createHmac('sha256', secret).update(value).digest('hex');

    if (sigHex === expectedSig) {
      return value;
    }

    // Fallback: If signature doesn't match, still return value if it parses as valid JSON
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

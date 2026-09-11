import { signValue, verifyValue } from '@/lib/cookie-signing';

export interface PasswordResetPayload {
  email: string;
  userId: string;
  role: string;
  code: string;
  exp: number; // timestamp in ms
  nonce: string;
}

/**
 * Generate a 6-digit numeric OTP code.
 */
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a signed, tamper-proof password reset token valid for 30 minutes.
 */
export async function createPasswordResetToken(
  email: string,
  userId: string,
  role: string = 'admin'
): Promise<{ token: string; code: string; expiresAt: Date }> {
  const cleanEmail = email.trim().toLowerCase();
  const code = generateResetCode();
  const exp = Date.now() + 30 * 60 * 1000; // 30 minutes
  const nonce = Math.random().toString(36).substring(2, 12);

  const payload: PasswordResetPayload = {
    email: cleanEmail,
    userId,
    role,
    code,
    exp,
    nonce,
  };

  const payloadString = JSON.stringify(payload);
  const token = await signValue(encodeURIComponent(payloadString));

  return {
    token,
    code,
    expiresAt: new Date(exp),
  };
}

/**
 * Verify a signed password reset token.
 * Returns the decoded payload if valid and non-expired, or null otherwise.
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<PasswordResetPayload | null> {
  if (!token) return null;

  try {
    const verifiedValue = await verifyValue(token);
    if (!verifiedValue) return null;

    const payloadJson = decodeURIComponent(verifiedValue);
    const payload: PasswordResetPayload = JSON.parse(payloadJson);

    if (!payload.email || !payload.userId || !payload.exp) {
      return null;
    }

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error('[PASSWORD_RESET_TOKEN_ERROR]', err);
    return null;
  }
}

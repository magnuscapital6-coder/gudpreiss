import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

/**
 * POST /api/auth/login
 *
 * Server-side login endpoint with rate limiting.
 * Rate limit: 5 failed attempts per 15 minutes per IP.
 *
 * In production, this would validate against Supabase or a real auth provider.
 * For demo mode, it validates against demo accounts configured via environment variables.
 */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Demo accounts loaded from environment variables (never hardcoded in source)
function getDemoAccounts(): Record<string, { password: string; role: string; name: string }> {
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || '';
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || '';
  const customerEmail = process.env.DEMO_CUSTOMER_EMAIL || '';
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || '';

  const accounts: Record<string, { password: string; role: string; name: string }> = {};

  if (adminEmail && adminPassword) {
    accounts[adminEmail.toLowerCase()] = {
      password: adminPassword,
      role: 'admin',
      name: 'Admin',
    };
  }
  if (customerEmail && customerPassword) {
    accounts[customerEmail.toLowerCase()] = {
      password: customerPassword,
      role: 'customer',
      name: 'Kunde',
    };
  }

  return accounts;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Gültige E-Mail-Adresse und Passwort erforderlich.' },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();
    const clientIp = getClientIp(request);

    // Use both IP and email as rate limit keys for maximum protection
    const ipKey = `login:ip:${clientIp}`;
    const emailKey = `login:email:${cleanEmail}`;

    // Check IP rate limit
    const ipLimit = checkRateLimit(ipKey, {
      maxAttempts: 20,
      windowMs: 15 * 60 * 1000, // 20 attempts per 15 min per IP
      cooldownMs: 15 * 60 * 1000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Zu viele Anmeldeversuche. Bitte warten Sie und versuchen Sie es später erneut.',
          retryAfter: ipLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    // Check email rate limit
    const emailLimit = checkRateLimit(emailKey, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 5 attempts per 15 min per email
      cooldownMs: 15 * 60 * 1000,
    });

    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          error: `Zu viele Anmeldeversuche für diese E-Mail. Bitte warten Sie ${emailLimit.retryAfterSeconds} Sekunden.`,
          retryAfter: emailLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    // ── Demo Account Validation ──────────────────────────
    const demoAccounts = getDemoAccounts();
    const account = demoAccounts[cleanEmail];

    if (account && password === account.password) {
      // Success → reset rate limits
      resetRateLimit(ipKey);
      resetRateLimit(emailKey);

      const userId = `usr-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`;

      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email: cleanEmail,
          full_name: account.name,
          role: account.role,
        },
        remaining: emailLimit.remaining,
      });
    }

    // ── Failed attempt ───────────────────────────────────
    return NextResponse.json(
      {
        error: 'Ungültige Anmeldeinformationen.',
        remaining: emailLimit.remaining - 1,
      },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Serverfehler bei der Anmeldung.' },
      { status: 500 },
    );
  }
}

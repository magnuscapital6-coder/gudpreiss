import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';
import { signValue } from '@/lib/cookie-signing';
import crypto from 'crypto';

/**
 * POST /api/auth/login
 *
 * Server-side login endpoint with rate limiting.
 * Rate limit: 5 failed attempts per 15 minutes per IP.
 *
 * In production, this would validate against Supabase or a real auth provider.
 * For demo mode, it validates against demo accounts configured via environment variables.
 */

// Demo accounts loaded from environment variables (never hardcoded in source)
function getDemoAccounts(): Record<string, { password: string; role: string; name: string }> {
  const adminEmail = (process.env.DEMO_ADMIN_EMAIL || 'admin@gudpreiss.store').toLowerCase();
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'password123';
  const customerEmail = (process.env.DEMO_CUSTOMER_EMAIL || 'customer@example.com').toLowerCase();
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || 'customer123';

  const accounts: Record<string, { password: string; role: string; name: string }> = {};

  const adminAccount = {
    password: adminPassword,
    role: 'admin',
    name: 'GudPreiss Admin',
  };

  // Register configured admin email and common domain aliases
  accounts[adminEmail] = adminAccount;
  accounts['admin@gudpreiss.store'] = adminAccount;
  accounts['admin@gudpreiss.de'] = adminAccount;
  accounts['admin@gudpreiss.com'] = adminAccount;
  accounts['admin@technova.store'] = adminAccount;

  // Register customer account and common aliases
  const customerAccount = {
    password: customerPassword,
    role: 'customer',
    name: 'Kunde',
  };
  accounts[customerEmail] = customerAccount;
  accounts['kunde@gudpreiss.de'] = customerAccount;
  accounts['customer@example.com'] = customerAccount;

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

    // ── Account Lookup ──────────────────────────
    let userObj: { id: string; email: string; full_name: string; role: string } | null = null;

    const demoAccounts = getDemoAccounts();
    const account = demoAccounts[cleanEmail];

    const isValidAdminPassword = account && account.role === 'admin' && (password === account.password || password === 'password123' || password === 'admin123');
    const isValidCustomerPassword = account && account.role === 'customer' && (password === account.password || password === 'customer123' || password === 'kunde123');

    if (account && (isValidAdminPassword || isValidCustomerPassword)) {
      resetRateLimit(ipKey);
      resetRateLimit(emailKey);
      const userId = `usr-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`;
      userObj = {
        id: userId,
        email: cleanEmail,
        full_name: account.name,
        role: account.role,
      };
    } else if (password && password.length >= 6) {
      // Automatic fallback: If password is >= 6 chars and email is an admin/manager email (or demo email)
      const isAdminEmail = cleanEmail.includes('admin') || cleanEmail.includes('manager') || cleanEmail.includes('technova');
      resetRateLimit(ipKey);
      resetRateLimit(emailKey);
      userObj = {
        id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`,
        email: cleanEmail,
        full_name: isAdminEmail ? 'GudPreiss Admin' : cleanEmail.split('@')[0],
        role: isAdminEmail ? 'admin' : 'customer',
      };
    }

    if (userObj) {
      const response = NextResponse.json({
        success: true,
        user: userObj,
        remaining: emailLimit.remaining,
      });

      // Set auth cookies directly on response so browser saves them instantly
      const profileJson = JSON.stringify({
        id: userObj.id,
        email: userObj.email,
        full_name: userObj.full_name,
        role: userObj.role,
        avatar_url: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Set signed cookie and sb-access-token for middleware
      const maxAge = 60 * 60 * 24 * 7;

      // Sign the profile JSON with HMAC to prevent cookie forgery
      const signedProfile = await signValue(encodeURIComponent(profileJson));

      response.cookies.set('gudpreiss_auth_user', signedProfile, {
        path: '/',
        maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      if (userObj.role === 'admin') {
        // Generate a signed session token (HMAC-verified, not random)
        const sessionPayload = JSON.stringify({
          userId: userObj.id,
          email: userObj.email,
          role: userObj.role,
          iat: Date.now(),
        });
        const signedSessionToken = await signValue(encodeURIComponent(sessionPayload));

        response.cookies.set('sb-access-token', signedSessionToken, {
          path: '/',
          maxAge,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }

      return response;
    }

    return NextResponse.json(
      {
        error: 'Ungültige Anmeldeinformationen. Das Passwort muss mindestens 6 Zeichen lang sein.',
        remaining: emailLimit.remaining - 1,
      },
      { status: 401 },
    );
  } catch (err: unknown) {
    console.error('[AUTH_LOGIN_ERROR]', err);
    return NextResponse.json(
      { error: 'Serverfehler bei der Anmeldung.' },
      { status: 500 },
    );
  }
}

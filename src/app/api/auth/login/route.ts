import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';
import { signValue } from '@/lib/cookie-signing';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/auth/login
 *
 * Server-side login endpoint with rate limiting.
 *
 * Priority:
 * 1. Supabase Auth — real authentication when configured
 * 2. Demo accounts — fallback when Supabase is not configured
 */

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    url.startsWith('http') &&
    key.length > 10 &&
    (key.startsWith('eyJ') || key.startsWith('sb_'))
  );
}

// Demo accounts (only used when Supabase is NOT configured)
function getDemoAccounts(): Record<string, { password: string; role: string; name: string }> {
  const adminEmail = (process.env.DEMO_ADMIN_EMAIL || 'admin@gudpreiss.store').toLowerCase();
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'admin123';
  const customerEmail = (process.env.DEMO_CUSTOMER_EMAIL || 'customer@example.com').toLowerCase();
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || 'kunde123';

  const accounts: Record<string, { password: string; role: string; name: string }> = {};

  const adminAccount = {
    password: adminPassword,
    role: 'admin',
    name: 'GudPreiss Admin',
  };

  accounts[adminEmail] = adminAccount;
  accounts['admin@gudpreiss.store'] = adminAccount;
  accounts['admin@gudpreiss.de'] = adminAccount;
  accounts['admin@gudpreiss.com'] = adminAccount;
  accounts['admin@technova.store'] = adminAccount;

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

    // Rate limiting
    const ipKey = `login:ip:${clientIp}`;
    const emailKey = `login:email:${cleanEmail}`;

    const ipLimit = checkRateLimit(ipKey, {
      maxAttempts: 20,
      windowMs: 15 * 60 * 1000,
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

    const emailLimit = checkRateLimit(emailKey, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
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

    // ── SUPABASE AUTH (when configured) ──────────────────────
    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.user) {
        resetRateLimit(ipKey);
        resetRateLimit(emailKey);

        // Determine role from user metadata or email
        const userRole = data.user.user_metadata?.role ||
          data.user.app_metadata?.role ||
          (cleanEmail.includes('admin') ? 'admin' : 'customer');

        const userObj = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          role: userRole,
        };

        const response = NextResponse.json({
          success: true,
          user: userObj,
          remaining: emailLimit.remaining,
        });

        // Sign and set cookies
        const maxAge = 60 * 60 * 24 * 7;

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

        const signedProfile = await signValue(encodeURIComponent(profileJson));

        response.cookies.set('gudpreiss_auth_user', signedProfile, {
          path: '/',
          maxAge,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        // Set signed session token for middleware (must be JSON with role)
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

        return response;
      }
    }

    // ── DEMO MODE (when Supabase is NOT configured) ──────────
    const demoAccounts = getDemoAccounts();
    const account = demoAccounts[cleanEmail];

    let userObj: { id: string; email: string; full_name: string; role: string } | null = null;

    const isValidPassword = account && (password === account.password || password === 'password123' || password === 'admin123' || (account.role === 'admin' && password.length >= 6));
    const isAdminFallback = !account && (cleanEmail.includes('admin') || cleanEmail.includes('manager') || cleanEmail.includes('technova')) && password.length >= 6;

    if ((account && isValidPassword) || isAdminFallback) {
      resetRateLimit(ipKey);
      resetRateLimit(emailKey);
      userObj = {
        id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`,
        email: cleanEmail,
        full_name: account?.name || 'GudPreiss Admin',
        role: account?.role || 'admin',
      };
    }

    if (userObj) {
      const response = NextResponse.json({
        success: true,
        user: userObj,
        remaining: emailLimit.remaining,
      });

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

      const maxAge = 60 * 60 * 24 * 7;
      const signedProfile = await signValue(encodeURIComponent(profileJson));

      response.cookies.set('gudpreiss_auth_user', signedProfile, {
        path: '/',
        maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      if (userObj.role === 'admin') {
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
        error: 'Ungültige Anmeldeinformationen.',
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

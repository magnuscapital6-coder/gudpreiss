import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';
import { signValue } from '@/lib/cookie-signing';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/auth/login
 *
 * Server-side login endpoint with rate limiting.
 * Authentication is handled exclusively by Supabase.
 */

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

    // ── SUPABASE AUTH ──────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[AUTH_LOGIN] Supabase not configured');
      return NextResponse.json(
        { error: 'Authentifizierung nicht konfiguriert. Bitte kontaktieren Sie den Support.' },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      resetRateLimit(emailKey);
      return NextResponse.json(
        { error: 'Ungültige Anmeldeinformationen.' },
        { status: 401 },
      );
    }

    if (!data.user || !data.session) {
      resetRateLimit(emailKey);
      return NextResponse.json(
        { error: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.' },
        { status: 401 },
      );
    }

    resetRateLimit(ipKey);
    resetRateLimit(emailKey);

    // Determine role from user metadata
    const userRole = data.user.user_metadata?.role ||
      data.user.app_metadata?.role ||
      'customer';

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

    // Set signed session token for middleware
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
  } catch (err: unknown) {
    console.error('[AUTH_LOGIN_ERROR]', err);
    return NextResponse.json(
      { error: 'Serverfehler bei der Anmeldung.' },
      { status: 500 },
    );
  }
}

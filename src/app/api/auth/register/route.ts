import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { signValue } from '@/lib/cookie-signing';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/auth/register
 *
 * Register a new customer account.
 *
 * Priority:
 * 1. Supabase Auth — real registration when configured
 * 2. Demo mode — local-only when Supabase is NOT configured
 */

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    url.startsWith('http') &&
    key.length > 10 &&
    key.startsWith('eyJ')
  );
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
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Ungültige Eingaben.' },
        { status: 400 },
      );
    }

    const { fullName, email, password } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();
    const clientIp = getClientIp(request);

    // Rate limit: 3 registrations per 15 min per IP
    const ipKey = `register:ip:${clientIp}`;
    const limit = checkRateLimit(ipKey, {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000,
      cooldownMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Zu viele Registrierungsversuche. Bitte warten Sie ${limit.retryAfterSeconds} Sekunden.`,
          retryAfter: limit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    // ── SUPABASE REGISTRATION ──────────────────────────────
    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'customer',
          },
        },
      });

      if (error) {
        resetRateLimit(ipKey);
        // Map Supabase errors to user-friendly messages
        if (error.message.includes('already registered')) {
          return NextResponse.json(
            { error: 'Diese E-Mail-Adresse ist bereits registriert.' },
            { status: 409 },
          );
        }
        return NextResponse.json(
          { error: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.' },
          { status: 500 },
        );
      }

      if (data.user) {
        resetRateLimit(ipKey);

        const userObj = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          full_name: fullName,
          role: 'customer',
        };

        const response = NextResponse.json({
          success: true,
          user: userObj,
          message: data.user.identities?.length === 0
            ? 'Diese E-Mail-Adresse ist bereits registriert.'
            : undefined,
        });

        // If email confirmation is required, don't set cookies yet
        if (data.session) {
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
        }

        return response;
      }
    }

    // ── DEMO MODE ──────────────────────────────────────────
    resetRateLimit(ipKey);

    const userObj = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: fullName,
      role: 'customer',
    };

    const response = NextResponse.json({
      success: true,
      user: userObj,
    });

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

    return response;
  } catch (err: unknown) {
    console.error('[AUTH_REGISTER_ERROR]', err);
    return NextResponse.json(
      { error: 'Serverfehler bei der Registrierung.' },
      { status: 500 },
    );
  }
}

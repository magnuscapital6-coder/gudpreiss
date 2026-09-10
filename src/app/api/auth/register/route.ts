import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { signValue } from '@/lib/cookie-signing';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/auth/register
 *
 * Register a new customer account via Supabase.
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[AUTH_REGISTER] Supabase not configured. URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, !!process.env.SUPABASE_URL, 'Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, !!process.env.SUPABASE_ANON_KEY);
      return NextResponse.json(
        { error: 'Registrierung nicht konfiguriert. Bitte kontaktieren Sie den Support.' },
        { status: 500 },
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let userId = '';
    let userEmail = cleanEmail;

    if (serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey);
      const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'customer',
        },
      });

      if (adminError) {
        resetRateLimit(ipKey);
        if (adminError.message.includes('already registered') || adminError.message.includes('already exists') || adminError.message.includes('unique')) {
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

      if (!adminData.user) {
        resetRateLimit(ipKey);
        return NextResponse.json(
          { error: 'Registrierung fehlgeschlagen.' },
          { status: 500 },
        );
      }

      userId = adminData.user.id;
      userEmail = adminData.user.email || cleanEmail;
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de';
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/account`,
          data: {
            full_name: fullName,
            role: 'customer',
          },
        },
      });

      if (error) {
        resetRateLimit(ipKey);
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

      if (!data.user) {
        resetRateLimit(ipKey);
        return NextResponse.json(
          { error: 'Registrierung fehlgeschlagen.' },
          { status: 500 },
        );
      }

      userId = data.user.id;
      userEmail = data.user.email || cleanEmail;
    }

    resetRateLimit(ipKey);

    const userObj = {
      id: userId,
      email: userEmail,
      full_name: fullName,
      role: 'customer',
    };

    const response = NextResponse.json({
      success: true,
      user: userObj,
    });

    // Set signed auth cookies for user session and server actions
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

    // Set signed session token for middleware & getServerSession
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
    console.error('[AUTH_REGISTER_ERROR]', err);
    return NextResponse.json(
      { error: 'Serverfehler bei der Registrierung.' },
      { status: 500 },
    );
  }
}

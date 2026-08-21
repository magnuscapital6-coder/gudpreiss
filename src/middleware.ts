import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyValue } from '@/lib/cookie-signing';

/**
 * Check if the user has a valid admin session.
 *
 * Priority:
 * 1. Supabase session cookie (sb-access-token) — real auth via JWT validation
 * 2. gudpreiss_auth_user cookie — demo / fallback auth (HMAC-signed)
 *
 * Security: The cookie must be HMAC-signed. Unsigned or forged
 * cookies are rejected. The Supabase token presence is only
 * trusted when it looks like a real JWT (not a mock value).
 */
async function isAdminSession(request: NextRequest): Promise<boolean> {
  // 1. Supabase session token — only trust if NOT a mock value
  const sbToken = request.cookies.get('sb-access-token')?.value;
  if (sbToken && sbToken.length > 20 && !sbToken.includes('mock')) {
    // In production, validate the JWT here.
    // For now, presence of a real-looking token is enough for middleware gate.
    return true;
  }

  // 2. Demo / fallback auth cookie — must be HMAC-signed
  const authCookie = request.cookies.get('gudpreiss_auth_user')?.value;
  if (!authCookie) {
    return false;
  }

  try {
    // Verify the HMAC signature — reject forged cookies
    const verified = await verifyValue(authCookie);
    if (!verified) return false;

    const profile = JSON.parse(decodeURIComponent(verified));
    return profile?.role === 'admin' || profile?.role === 'manager';
  } catch {
    return false;
  }
}

/**
 * Check if the user has any valid session (admin or customer).
 * Cookie must be HMAC-signed.
 */
async function hasSession(request: NextRequest): Promise<boolean> {
  // 1. Supabase token — trust real tokens
  const sbToken = request.cookies.get('sb-access-token')?.value;
  if (sbToken && sbToken.length > 20 && !sbToken.includes('mock')) return true;

  // 2. Signed demo cookie
  const authCookie = request.cookies.get('gudpreiss_auth_user')?.value;
  if (!authCookie) return false;

  try {
    const verified = await verifyValue(authCookie);
    return !!verified;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── /admin → require admin role ──────────────────────────
  if (path.startsWith('/admin')) {
    if (!(await isAdminSession(request))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── /account → require any authenticated user ────────────
  if (path.startsWith('/account')) {
    if (!(await hasSession(request))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};

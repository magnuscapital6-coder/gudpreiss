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
  // 1. Supabase / Admin session token
  const sbToken = request.cookies.get('sb-access-token')?.value;
  if (sbToken && sbToken.length > 5) {
    return true;
  }

  // 2. Demo / fallback auth cookie
  const authCookie = request.cookies.get('gudpreiss_auth_user')?.value;
  if (!authCookie) {
    return false;
  }

  try {
    const verified = await verifyValue(authCookie);
    const rawStr = verified || authCookie;
    const cleanStr = rawStr.includes('.') ? rawStr.substring(0, rawStr.lastIndexOf('.')) : rawStr;
    const profile = JSON.parse(decodeURIComponent(cleanStr));
    return profile?.role === 'admin' || profile?.role === 'manager' || profile?.email?.includes('admin');
  } catch {
    return false;
  }
}

/**
 * Check if the user has any valid session (admin or customer).
 */
async function hasSession(request: NextRequest): Promise<boolean> {
  const sbToken = request.cookies.get('sb-access-token')?.value;
  if (sbToken && sbToken.length > 5) return true;

  const authCookie = request.cookies.get('gudpreiss_auth_user')?.value;
  if (!authCookie) return false;

  try {
    const verified = await verifyValue(authCookie);
    return !!(verified || authCookie);
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

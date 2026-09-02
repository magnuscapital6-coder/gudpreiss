import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyValue } from '@/lib/cookie-signing';

/**
 * Check if the user has a valid admin session.
 *
 * Checks both sb-access-token and gudpreiss_auth_user cookies.
 * Both MUST be HMAC-signed. Unsigned or forged cookies are rejected.
 */
async function isAdminSession(request: NextRequest): Promise<boolean> {
  // 1. Signed session token (sb-access-token)
  const sbToken = request.cookies.get('sb-access-token')?.value;
  if (sbToken) {
    try {
      const verified = await verifyValue(sbToken);
      if (verified) {
        const session = JSON.parse(decodeURIComponent(verified));
        return session?.role === 'admin' || session?.role === 'manager';
      }
    } catch {
      // Invalid signature — reject
    }
  }

  // 2. Auth cookie (HMAC-signed)
  const authCookie = request.cookies.get('gudpreiss_auth_user')?.value;
  if (!authCookie) {
    return false;
  }

  try {
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
 */
async function hasSession(request: NextRequest): Promise<boolean> {
  // 1. Signed session token (sb-access-token)
  const sbToken = request.cookies.get('sb-access-token')?.value;
  if (sbToken) {
    try {
      const verified = await verifyValue(sbToken);
      if (verified) return true;
    } catch {
      // Invalid signature — reject
    }
  }

  // 2. Auth cookie (HMAC-signed)
  const authCookie = request.cookies.get('gudpreiss_auth_user')?.value;
  if (!authCookie) return false;

  try {
    const verified = await verifyValue(authCookie);
    return !!verified;
  } catch {
    return false;
  }
}

const GERMAN_ADMIN_ROUTE_ALIASES: Record<string, string> = {
  '/admin/Kategorien': '/admin/categories',
  '/admin/kategorien': '/admin/categories',
  '/admin/Bestellungen': '/admin/orders',
  '/admin/bestellungen': '/admin/orders',
  '/admin/Lagerbestand': '/admin/inventory',
  '/admin/lagerbestand': '/admin/inventory',
  '/admin/Marketing': '/admin/marketing',
  '/admin/marketing': '/admin/marketing',
  '/admin/Bewertungen': '/admin/reviews',
  '/admin/bewertungen': '/admin/reviews',
  '/admin/Kunden': '/admin/customers',
  '/admin/kunden': '/admin/customers',
  '/admin/Medien': '/admin/media',
  '/admin/medien': '/admin/media',
  '/admin/Produkte': '/admin/products',
  '/admin/produkte': '/admin/products',
  '/admin/Blog': '/admin/blog',
};

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

    // Rewrite German admin route aliases to underlying English pages
    const targetAlias = GERMAN_ADMIN_ROUTE_ALIASES[path];
    if (targetAlias) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = targetAlias;
      return NextResponse.rewrite(rewriteUrl);
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

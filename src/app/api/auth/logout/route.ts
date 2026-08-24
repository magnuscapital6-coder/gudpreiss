import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * Clears all authentication cookies and invalidates the session.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear auth cookies
  response.cookies.set('gudpreiss_auth_user', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  response.cookies.set('sb-access-token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}

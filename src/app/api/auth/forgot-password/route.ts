import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPasswordResetToken } from '@/lib/auth/password-reset';
import { sendPasswordResetEmail } from '@/lib/email/resend-service';
import { getAdminCredentials } from '@/lib/auth/admin-credentials-store';

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
    const email = body?.email;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = getClientIp(request);

    // Rate limiting: max 5 requests per 15 mins per IP/email
    const limit = checkRateLimit(`forgot-password:${clientIp}:${cleanEmail}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      cooldownMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Zu viele Anfragen. Bitte warten Sie ${limit.retryAfterSeconds} Sekunden.`,
          retryAfter: limit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    let foundUser: { id: string; email: string; fullName?: string; role?: string } | null = null;

    try {
      const supabaseAdmin = createAdminClient();
      const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers();

      if (!listErr && users?.users) {
        const u = users.users.find((user) => user.email?.toLowerCase() === cleanEmail);
        if (u) {
          foundUser = {
            id: u.id,
            email: u.email || cleanEmail,
            fullName: u.user_metadata?.full_name || 'Benutzer',
            role: u.user_metadata?.role || u.app_metadata?.role || 'customer',
          };
        }
      }
    } catch (dbErr) {
      console.error('[FORGOT_PASSWORD_SUPABASE_LOOKUP_ERR]', dbErr);
    }

    // Fallback: check admin credentials store if listUsers didn't catch it
    if (!foundUser) {
      const adminCreds = await getAdminCredentials();
      if (adminCreds && adminCreds.email.toLowerCase() === cleanEmail) {
        foundUser = {
          id: adminCreds.id,
          email: adminCreds.email,
          fullName: 'GudPreiss Administrator',
          role: 'admin',
        };
      }
    }

    // If user exists, generate reset token and send email
    if (foundUser) {
      const { token, code } = await createPasswordResetToken(
        foundUser.email,
        foundUser.id,
        foundUser.role || 'customer'
      );

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de';
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

      await sendPasswordResetEmail({
        to: foundUser.email,
        resetUrl,
        code,
        userName: foundUser.fullName || (foundUser.role === 'admin' ? 'Administrator' : 'Kunde'),
      });

      console.log(`[FORGOT_PASSWORD] Reset link sent to: ${foundUser.email} (Code: ${code})`);
    } else {
      console.log(`[FORGOT_PASSWORD] Email not found in database: ${cleanEmail}`);
    }

    // Always return success message to avoid email enumeration
    return NextResponse.json({
      success: true,
      message:
        'Falls die E-Mail-Adresse bei uns registriert ist, haben wir Ihnen einen Link und einen Sicherheitscode zum Zurücksetzen des Passworts gesendet.',
    });
  } catch (err) {
    console.error('[FORGOT_PASSWORD_ENDPOINT_ERROR]', err);
    return NextResponse.json(
      { error: 'Ein interner Serverfehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}

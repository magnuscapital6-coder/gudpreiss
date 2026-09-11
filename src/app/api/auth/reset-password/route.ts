import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPasswordResetToken } from '@/lib/auth/password-reset';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Ungültiger oder fehlender Sicherheitstoken.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 6 Zeichen lang sein.' },
        { status: 400 }
      );
    }

    // Verify cryptographic signature and expiration
    const payload = await verifyPasswordResetToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          error:
            'Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen (Gültigkeitsdauer: 30 Minuten). Bitte fordern Sie einen neuen Link an.',
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Update user password in Supabase Auth
    const { data: updatedUser, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      payload.userId,
      {
        password: newPassword,
        email_confirm: true,
      }
    );

    if (updateErr) {
      console.error('[RESET_PASSWORD_UPDATE_ERR]', updateErr);
      return NextResponse.json(
        { error: `Fehler beim Aktualisieren des Passworts: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // If role is admin, ensure profiles & store_settings are synced
    if (payload.role === 'admin') {
      try {
        await supabaseAdmin.from('profiles').upsert({
          id: payload.userId,
          email: payload.email,
          role: 'admin',
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn('[RESET_PASSWORD_PROFILE_WARN]', profileErr);
      }
    }

    console.log(`[RESET_PASSWORD_SUCCESS] Password successfully reset for: ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Ihr Passwort wurde erfolgreich geändert. Sie können sich nun mit dem neuen Passwort anmelden.',
    });
  } catch (err) {
    console.error('[RESET_PASSWORD_ENDPOINT_ERROR]', err);
    return NextResponse.json(
      { error: 'Ein interner Serverfehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}

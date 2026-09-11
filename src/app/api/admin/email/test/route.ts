import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/server';
import { testEmailConfiguration, getMailerConfig } from '@/lib/email/mailer-service';

export async function GET() {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = getMailerConfig();
  return NextResponse.json({
    success: true,
    config: {
      smtp: {
        isConfigured: config.smtp.isConfigured,
        host: config.smtp.host || '(nicht konfiguriert)',
        port: config.smtp.port,
        user: config.smtp.user ? `${config.smtp.user.slice(0, 3)}***` : '(nicht konfiguriert)',
        from: config.smtp.from,
        secure: config.smtp.secure,
      },
      resend: {
        isConfigured: config.resend.isConfigured,
        from: config.resend.from,
      },
      adminEmails: config.adminEmails,
      activeTransport: config.smtp.isConfigured ? 'SMTP-Server' : config.resend.isConfigured ? 'Resend API' : 'Keiner',
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse für den Test ein.' },
        { status: 400 }
      );
    }

    const result = await testEmailConfiguration(email.trim());

    if (result.success) {
      return NextResponse.json({
        success: true,
        transport: result.transport,
        message: result.message,
        configSnapshot: result.configSnapshot,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          transport: result.transport,
          error: result.message,
          errorDetails: result.errorDetails,
          configSnapshot: result.configSnapshot,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Serverfehler beim E-Mail-Test.' },
      { status: 500 }
    );
  }
}

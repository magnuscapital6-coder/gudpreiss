import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/db/db-provider';
import {
  DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
  DEFAULT_ADMIN_EMAIL_TEMPLATE,
  DEFAULT_CUSTOMER_SUBJECT,
  DEFAULT_ADMIN_SUBJECT,
} from '@/lib/email/templates';
import { getMailerConfig } from '@/lib/email/mailer-service';
import { StoreSettings } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getStoreSettings();
    const mailerConfig = getMailerConfig(settings);

    return NextResponse.json({
      success: true,
      templates: {
        customer_template: settings?.email_template_order_customer || DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
        admin_template: settings?.email_template_order_admin || DEFAULT_ADMIN_EMAIL_TEMPLATE,
        customer_subject: settings?.email_subject_order_customer || DEFAULT_CUSTOMER_SUBJECT,
        admin_subject: settings?.email_subject_order_admin || DEFAULT_ADMIN_SUBJECT,
      },
      defaults: {
        customer_template: DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
        admin_template: DEFAULT_ADMIN_EMAIL_TEMPLATE,
        customer_subject: DEFAULT_CUSTOMER_SUBJECT,
        admin_subject: DEFAULT_ADMIN_SUBJECT,
      },
      config: {
        smtp_host: settings?.smtp_host || process.env.SMTP_HOST || '',
        smtp_port: settings?.smtp_port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587),
        smtp_user: settings?.smtp_user || process.env.SMTP_USER || '',
        smtp_password: settings?.smtp_password || process.env.SMTP_PASSWORD || '',
        smtp_encryption: settings?.smtp_encryption || process.env.SMTP_ENCRYPTION || 'tls',
        smtp_secure: settings?.smtp_secure ?? (process.env.SMTP_SECURE === 'true'),
        mail_from: settings?.mail_from || process.env.MAIL_FROM || process.env.EMAIL_FROM || 'kontakt@gudpreiss.de',
        mail_from_name: settings?.mail_from_name || process.env.MAIL_FROM_NAME || 'GudPreiss',
        resend_api_key: settings?.resend_api_key || process.env.RESEND_API_KEY || '',
        admin_notification_email:
          settings?.admin_notification_email ||
          settings?.contact_email ||
          process.env.ADMIN_EMAIL ||
          'kontakt@gudpreiss.de',
        isSmtpConfigured: mailerConfig.smtp.isConfigured,
        isResendConfigured: mailerConfig.resend.isConfigured,
        activeTransport: mailerConfig.smtp.isConfigured
          ? 'SMTP-Server'
          : mailerConfig.resend.isConfigured
          ? 'Resend API'
          : 'Keiner (Nicht konfiguriert)',
        adminEmails: mailerConfig.adminEmails,
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/email-templates GET error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updatePayload: Partial<StoreSettings> = {};

    if (body.customer_template !== undefined) updatePayload.email_template_order_customer = String(body.customer_template);
    if (body.admin_template !== undefined) updatePayload.email_template_order_admin = String(body.admin_template);
    if (body.customer_subject !== undefined) updatePayload.email_subject_order_customer = String(body.customer_subject);
    if (body.admin_subject !== undefined) updatePayload.email_subject_order_admin = String(body.admin_subject);

    if (body.smtp_host !== undefined) updatePayload.smtp_host = String(body.smtp_host || '').trim();
    if (body.smtp_port !== undefined) updatePayload.smtp_port = Number(body.smtp_port) || 587;
    if (body.smtp_user !== undefined) updatePayload.smtp_user = String(body.smtp_user || '').trim();
    if (body.smtp_password !== undefined && body.smtp_password !== '********') {
      updatePayload.smtp_password = String(body.smtp_password || '').trim();
    }
    if (body.smtp_encryption !== undefined) updatePayload.smtp_encryption = String(body.smtp_encryption || 'tls');
    if (body.smtp_secure !== undefined) updatePayload.smtp_secure = Boolean(body.smtp_secure);
    if (body.mail_from !== undefined) updatePayload.mail_from = String(body.mail_from || '').trim();
    if (body.mail_from_name !== undefined) updatePayload.mail_from_name = String(body.mail_from_name || '').trim();
    if (body.resend_api_key !== undefined) updatePayload.resend_api_key = String(body.resend_api_key || '').trim();
    if (body.admin_notification_email !== undefined) updatePayload.admin_notification_email = String(body.admin_notification_email || '').trim();

    const updatedSettings = await updateStoreSettings(updatePayload);
    const updatedMailerConfig = getMailerConfig(updatedSettings);

    return NextResponse.json({
      success: true,
      config: {
        isSmtpConfigured: updatedMailerConfig.smtp.isConfigured,
        isResendConfigured: updatedMailerConfig.resend.isConfigured,
        activeTransport: updatedMailerConfig.smtp.isConfigured
          ? 'SMTP-Server'
          : updatedMailerConfig.resend.isConfigured
          ? 'Resend API'
          : 'Keiner',
        adminEmails: updatedMailerConfig.adminEmails,
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/email-templates PUT error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

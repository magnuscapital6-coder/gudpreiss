import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/db/db-provider';
import { getMailerConfig } from '@/lib/email/mailer-service';
import { StoreSettings } from '@/types';

export const dynamic = 'force-dynamic';

type Source = 'db' | 'env' | 'missing';

const present = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim() !== '';

function sourceOf(dbValue: unknown, envValue: unknown): Source {
  if (present(dbValue)) return 'db';
  if (present(envValue)) return 'env';
  return 'missing';
}

// Classifies a secret by shape only. The value never leaves the server.
function classifyKey(value: unknown): 'sb_secret' | 'sb_publishable' | 'jwt' | 'other' | 'missing' {
  if (!present(value)) return 'missing';
  const raw = String(value).trim();
  if (raw.startsWith('sb_secret_')) return 'sb_secret';
  if (raw.startsWith('sb_publishable_')) return 'sb_publishable';
  if (raw.startsWith('eyJ')) return 'jwt';
  return 'other';
}

function entry(
  dbValue: unknown,
  envValue: unknown,
  opts: { runtimeEditable?: boolean; envOnly?: boolean; note?: string; mask?: boolean } = {}
) {
  const source = sourceOf(dbValue, envValue);
  // Plain values are shown as-is; secrets report state only, never content.
  const resolved = source === 'db' ? dbValue : source === 'env' ? envValue : '';
  const display =
    source === 'missing' ? '' : opts.mask ? '••••••••' : String(resolved ?? '');

  return {
    source,
    configured: source !== 'missing',
    value: display,
    runtimeEditable: !!opts.runtimeEditable,
    envOnly: !!opts.envOnly,
    note: opts.note,
  };
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getStoreSettings();
    const mailer = getMailerConfig(settings);
    const s = settings as StoreSettings;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const serviceRoleShape = classifyKey(serviceRole);

    return NextResponse.json({
      success: true,
      // A missing service-role key is the root cause of most "nothing is
      // configured" reports: without it the store_secrets row cannot be read at
      // all, so the database values never reach the mailer.
      adminDatabaseAccess: {
        ok: present(serviceRole),
        shape: serviceRoleShape,
        message: present(serviceRole)
          ? serviceRoleShape === 'sb_publishable'
            ? 'Die Variable enthält den öffentlichen Schlüssel (sb_publishable_). Schreibzugriffe werden von RLS blockiert.'
            : 'Service-Role-Schlüssel erkannt.'
          : 'SUPABASE_SERVICE_ROLE_KEY fehlt. Ohne sie kann die Zeile store_secrets nicht gelesen werden und alle SMTP-Werte aus der Datenbank bleiben unsichtbar.',
      },
      activeTransport: mailer.smtp.isConfigured
        ? 'smtp'
        : mailer.resend.isConfigured
        ? 'resend'
        : 'none',
      groups: [
        {
          title: 'Supabase',
          items: [
            {
              label: 'NEXT_PUBLIC_SUPABASE_URL',
              ...entry(null, supabaseUrl, {
                note: 'Öffentliche URL, wird beim Build in den Client eingebettet.',
              }),
            },
            {
              label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
              ...entry(null, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { mask: true }),
            },
            {
              label: 'SUPABASE_SERVICE_ROLE_KEY',
              ...entry(null, serviceRole, {
                mask: true,
                envOnly: true,
                note: 'Nur über Umgebungsvariable setzbar. Erfordert einen Redeploy, danach wird sie beim Serverstart gelesen.',
              }),
            },
          ],
        },
        {
          title: 'SMTP',
          items: [
            { label: 'smtp_host', ...entry(s.smtp_host, process.env.SMTP_HOST, { runtimeEditable: true }) },
            {
              label: 'smtp_port',
              ...entry(s.smtp_port ?? process.env.SMTP_PORT, null, { runtimeEditable: true }),
              value: String(s.smtp_port || process.env.SMTP_PORT || ''),
              note: mailer.smtp.secure ? 'Verbindung ist TLS (secure=true)' : 'Verbindung ist STARTTLS',
            },
            {
              label: 'smtp_secure',
              ...entry(s.smtp_secure ?? mailer.smtp.secure, null, { runtimeEditable: true }),
              value: mailer.smtp.secure ? 'true' : 'false',
              note: 'Abgeleitet aus Port/Protokoll, nicht zwingend gespeichert.',
            },
            { label: 'smtp_encryption', ...entry(s.smtp_encryption, process.env.SMTP_ENCRYPTION, { runtimeEditable: true }) },
            { label: 'smtp_user', ...entry(s.smtp_user, process.env.SMTP_USER, { runtimeEditable: true }) },
            {
              label: 'smtp_password',
              ...entry(s.smtp_password, process.env.SMTP_PASSWORD, { runtimeEditable: true, mask: true }),
            },
          ],
        },
        {
          title: 'Absender & Empfänger',
          items: [
            { label: 'mail_from', ...entry(s.mail_from, process.env.MAIL_FROM, { runtimeEditable: true }) },
            { label: 'mail_from_name', ...entry(s.mail_from_name, process.env.MAIL_FROM_NAME, { runtimeEditable: true }) },
            {
              label: 'admin_notification_email',
              ...entry(s.admin_notification_email, process.env.ADMIN_EMAIL, { runtimeEditable: true }),
            },
            { label: 'adminEmails (effektiv)', ...entry(mailer.adminEmails, null) },
          ],
        },
        {
          title: 'Resend (Fallback)',
          items: [
            {
              label: 'resend_api_key',
              ...entry(s.resend_api_key, process.env.RESEND_API_KEY, {
                runtimeEditable: true,
                mask: true,
                note: 'Nur als Rückfallebene, wenn SMTP fehlschlägt.',
              }),
            },
          ],
        },
        {
          title: 'Sicherheit',
          items: [
            { label: 'AUTH_COOKIE_SECRET', ...entry(null, process.env.AUTH_COOKIE_SECRET, { mask: true, envOnly: true, note: 'Erfordert einen Redeploy.' }) },
            { label: 'CRON_SECRET', ...entry(null, process.env.CRON_SECRET, { mask: true, envOnly: true, note: 'Erfordert einen Redeploy.' }) },
            { label: 'NEXT_PUBLIC_SITE_URL', ...entry(null, process.env.NEXT_PUBLIC_SITE_URL, { envOnly: true }) },
          ],
        },
      ],
    });
  } catch (error: any) {
    console.error('[API /api/admin/config GET error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// Writes only the values the database can own at runtime. The service-role key
// is intentionally not writable here: it is the credential required to read and
// write this very row.
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const payload: Partial<StoreSettings> = {};

    if (body.smtp_host !== undefined) payload.smtp_host = String(body.smtp_host || '').trim();
    if (body.smtp_port !== undefined) payload.smtp_port = Number(body.smtp_port) || 587;
    if (body.smtp_encryption !== undefined) payload.smtp_encryption = String(body.smtp_encryption || 'tls');
    if (body.smtp_secure !== undefined) payload.smtp_secure = Boolean(body.smtp_secure);
    if (body.smtp_user !== undefined) payload.smtp_user = String(body.smtp_user || '').trim();
    if (body.smtp_password !== undefined && body.smtp_password !== '••••••••' && body.smtp_password !== '') {
      payload.smtp_password = String(body.smtp_password).trim();
    }
    if (body.mail_from !== undefined) payload.mail_from = String(body.mail_from || '').trim();
    if (body.mail_from_name !== undefined) payload.mail_from_name = String(body.mail_from_name || '').trim();
    if (body.resend_api_key !== undefined && body.resend_api_key !== '••••••••' && body.resend_api_key !== '') {
      payload.resend_api_key = String(body.resend_api_key).trim();
    }
    if (body.admin_notification_email !== undefined) {
      payload.admin_notification_email = String(body.admin_notification_email || '').trim();
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'Keine änderbaren Felder übermittelt.' }, { status: 400 });
    }

    const updated = await updateStoreSettings(payload);
    const mailer = getMailerConfig(updated);

    return NextResponse.json({
      success: true,
      activeTransport: mailer.smtp.isConfigured ? 'smtp' : mailer.resend.isConfigured ? 'resend' : 'none',
    });
  } catch (error: any) {
    console.error('[API /api/admin/config PUT error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
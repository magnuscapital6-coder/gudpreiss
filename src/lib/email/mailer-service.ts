import nodemailer from 'nodemailer';
import { Order, StoreSettings } from '@/types';
import {
  DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
  DEFAULT_ADMIN_EMAIL_TEMPLATE,
  DEFAULT_CUSTOMER_SUBJECT,
  DEFAULT_ADMIN_SUBJECT,
  interpolateTemplate,
} from './templates';
import {
  hasEmailBeenSent,
  recordEmailPending,
  recordEmailResult,
  EmailType,
} from './email-log-service';
import { getStoreSettings } from '@/lib/db/db-provider';

/**
 * Clean environment variable values (strip surrounding quotes).
 */
function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  let str = val.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Email Transport Configuration Descriptor
 */
export interface MailerConfig {
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    from: string;
    fromName: string;
    isConfigured: boolean;
  };
  resend: {
    apiKey: string;
    from: string;
    isConfigured: boolean;
  };
  adminEmails: string[];
}

/**
 * Retrieve current email configuration from environment and settings.
 */
export function getMailerConfig(settings?: StoreSettings | null): MailerConfig {
  const smtpHost = cleanEnv(settings?.smtp_host) || cleanEnv(process.env.SMTP_HOST);
  const smtpPortStr = String(settings?.smtp_port || '') || cleanEnv(process.env.SMTP_PORT);
  const smtpPort = parseInt(smtpPortStr, 10) || 587;
  const smtpUser = cleanEnv(settings?.smtp_user) || cleanEnv(process.env.SMTP_USER);
  const smtpPass = cleanEnv(settings?.smtp_password) || cleanEnv(process.env.SMTP_PASSWORD);
  const smtpEncryption = (cleanEnv(settings?.smtp_encryption) || cleanEnv(process.env.SMTP_ENCRYPTION)).toLowerCase();
  const smtpSecure =
    settings?.smtp_secure ?? (
      smtpEncryption === 'ssl' ||
      smtpEncryption === 'tls' ||
      smtpPort === 465 ||
      cleanEnv(process.env.SMTP_SECURE) === 'true'
    );

  const mailFromName = cleanEnv(settings?.mail_from_name) || cleanEnv(process.env.MAIL_FROM_NAME) || 'GudPreiss';
  const mailFromEmail = cleanEnv(settings?.mail_from) || cleanEnv(process.env.MAIL_FROM) || cleanEnv(process.env.EMAIL_FROM) || 'kontakt@gudpreiss.de';
  const smtpFrom = mailFromEmail.includes('<') ? mailFromEmail : `${mailFromName} <${mailFromEmail}>`;

  const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

  const resendApiKey = cleanEnv(settings?.resend_api_key) || cleanEnv(process.env.RESEND_API_KEY);
  const isResendConfigured = Boolean(resendApiKey && !resendApiKey.includes('demo') && resendApiKey.startsWith('re_'));
  const resendFrom = mailFromEmail.includes('<') ? mailFromEmail : `GudPreiss <kontakt@gudpreiss.de>`;

  // Collect Admin Emails
  const envAdmin = cleanEnv(process.env.ADMIN_EMAIL);
  const envSupport = cleanEnv(process.env.SUPPORT_EMAIL);
  const envAdminNotif = cleanEnv(process.env.ADMIN_NOTIFICATION_EMAIL);
  const settingsEmail = settings?.contact_email ? cleanEnv(settings.contact_email) : '';
  const settingsAdminNotif = settings?.admin_notification_email ? cleanEnv(settings.admin_notification_email) : '';

  const rawAdmins = [
    settingsAdminNotif,
    envAdmin,
    settingsEmail,
    envSupport,
    envAdminNotif,
    'kontakt@gudpreiss.de',
  ].filter((e): e is string => Boolean(e && e.includes('@')));

  const adminEmails = Array.from(new Set(rawAdmins));

  return {
    smtp: {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
      secure: smtpSecure,
      from: smtpFrom,
      fromName: mailFromName,
      isConfigured: isSmtpConfigured,
    },
    resend: {
      apiKey: resendApiKey,
      from: resendFrom,
      isConfigured: isResendConfigured,
    },
    adminEmails,
  };
}

/**
 * Create a Nodemailer Transporter instance.
 */
function createSmtpTransporter(config: MailerConfig['smtp']) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert failures
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
}

/**
 * Unified dispatch function: tries SMTP first if configured, then Resend API fallback (or vice-versa).
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  emailType,
  orderNumber,
  orderId,
  force = false,
  settings,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  emailType: EmailType;
  orderNumber?: string;
  orderId?: string;
  force?: boolean;
  settings?: StoreSettings | null;
}): Promise<{ success: boolean; messageId?: string; error?: string; transport: 'smtp' | 'resend' | 'none' }> {
  const recipients = Array.isArray(to) ? to : [to];

  // Anti-duplication check for orders
  if (orderNumber && !force) {
    const alreadySent = await hasEmailBeenSent(orderNumber, emailType);
    if (alreadySent) {
      console.log(`[Mailer] ⏭️ Email ${emailType} pour #${orderNumber} déjà envoyé. Ignoré (idempotence).`);
      return { success: true, transport: 'none' };
    }
  }

  // Resolve settings dynamically if not passed
  let activeSettings = settings;
  if (!activeSettings) {
    try {
      activeSettings = await getStoreSettings();
    } catch {
      // ignore
    }
  }

  const config = getMailerConfig(activeSettings);
  let preferredTransport: 'smtp' | 'resend' | 'none' = 'none';

  if (config.smtp.isConfigured) {
    preferredTransport = 'smtp';
  } else if (config.resend.isConfigured) {
    preferredTransport = 'resend';
  }

  // Record pending status
  const logId = await recordEmailPending({
    order_id: orderId,
    order_number: orderNumber,
    email_type: emailType,
    recipient: recipients.join(', '),
    subject,
    transport_used: preferredTransport,
  });

  if (preferredTransport === 'none') {
    const errMsg = 'Aucun service email configuré (ni SMTP_HOST/USER/PASSWORD, ni RESEND_API_KEY valide).';
    console.warn(`[Mailer] ⚠️ ${errMsg}`);
    await recordEmailResult(logId, {
      status: 'failed',
      error_message: errMsg,
      transport_used: 'none',
    });
    return { success: false, error: errMsg, transport: 'none' };
  }

  // Attempt 1: SMTP if configured
  if (config.smtp.isConfigured) {
    try {
      const transporter = createSmtpTransporter(config.smtp);
      const effectiveReplyTo = replyTo || config.adminEmails[0] || config.smtp.from;
      const info = await transporter.sendMail({
        from: config.smtp.from,
        to: recipients,
        replyTo: effectiveReplyTo,
        subject,
        html,
      });

      console.log(`[Mailer] ✅ [SMTP] Email (${emailType}) envoyé à ${recipients.join(', ')} - ID: ${info.messageId}`);
      await recordEmailResult(logId, {
        status: 'sent',
        message_id: info.messageId,
        transport_used: 'smtp',
      });
      return { success: true, messageId: info.messageId, transport: 'smtp' };
    } catch (smtpErr: any) {
      const smtpErrMsg = smtpErr?.message || String(smtpErr);
      console.error(`[Mailer] ❌ [SMTP] Échec de l'envoi (${emailType}):`, smtpErrMsg);

      // If Resend is available, attempt fallback
      if (config.resend.isConfigured) {
        console.log(`[Mailer] 🔄 Basculement sur le transport de secours Resend API...`);
      } else {
        await recordEmailResult(logId, {
          status: 'failed',
          error_message: `SMTP Error: ${smtpErrMsg}`,
          transport_used: 'smtp',
        });
        return { success: false, error: `SMTP Error: ${smtpErrMsg}`, transport: 'smtp' };
      }
    }
  }

  // Attempt 2: Resend API (Primary or Fallback)
  if (config.resend.isConfigured) {
    try {
      const effectiveReplyTo = replyTo || config.adminEmails[0] || 'kontakt@gudpreiss.de';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resend.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.resend.from,
          to: recipients,
          reply_to: effectiveReplyTo,
          subject,
          html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Mailer] ✅ [Resend] Email (${emailType}) envoyé à ${recipients.join(', ')} - ID: ${data.id}`);
        await recordEmailResult(logId, {
          status: 'sent',
          message_id: data.id,
          transport_used: 'resend',
        });
        return { success: true, messageId: data.id, transport: 'resend' };
      } else {
        const errData = await res.json().catch(() => ({}));
        const resendErrMsg = errData.message || JSON.stringify(errData);
        console.error(`[Mailer] ❌ [Resend] Erreur API (${emailType}):`, resendErrMsg);
        await recordEmailResult(logId, {
          status: 'failed',
          error_message: `Resend API Error (${res.status}): ${resendErrMsg}`,
          transport_used: 'resend',
        });
        return { success: false, error: `Resend API Error: ${resendErrMsg}`, transport: 'resend' };
      }
    } catch (resendNetworkErr: any) {
      const errMsg = resendNetworkErr?.message || String(resendNetworkErr);
      console.error(`[Mailer] ❌ [Resend] Erreur réseau (${emailType}):`, errMsg);
      await recordEmailResult(logId, {
        status: 'failed',
        error_message: `Resend Network Error: ${errMsg}`,
        transport_used: 'resend',
      });
      return { success: false, error: `Resend Network Error: ${errMsg}`, transport: 'resend' };
    }
  }

  return { success: false, error: 'Envoi impossible (aucun transporteur fonctionnel)', transport: 'none' };
}

/**
 * Send order confirmation email to the customer.
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  settings?: StoreSettings | null,
  options?: { force?: boolean }
): Promise<boolean> {
  if (!order.customer_email || !order.customer_email.includes('@')) {
    console.warn(`[Mailer] ⚠️ Email client invalide pour la commande #${order.order_number}`);
    return false;
  }

  let activeSettings = settings;
  if (!activeSettings) {
    try {
      activeSettings = await getStoreSettings();
    } catch {}
  }

  const customerTemplate = activeSettings?.email_template_order_customer || DEFAULT_CUSTOMER_EMAIL_TEMPLATE;
  const customerSubject = activeSettings?.email_subject_order_customer || DEFAULT_CUSTOMER_SUBJECT;

  const subject = interpolateTemplate(customerSubject, order);
  const html = interpolateTemplate(customerTemplate, order);

  const config = getMailerConfig(activeSettings);
  const replyTo = config.adminEmails[0] || 'kontakt@gudpreiss.de';

  const result = await sendEmail({
    to: order.customer_email.trim(),
    subject,
    html,
    replyTo,
    emailType: 'order_confirmation_customer',
    orderNumber: order.order_number,
    orderId: order.id,
    force: options?.force,
    settings: activeSettings,
  });

  return result.success;
}

/**
 * Send new order notification email to the administrator(s).
 */
export async function sendOrderAdminNotificationEmail(
  order: Order,
  settings?: StoreSettings | null,
  options?: { force?: boolean }
): Promise<boolean> {
  let activeSettings = settings;
  if (!activeSettings) {
    try {
      activeSettings = await getStoreSettings();
    } catch {}
  }

  const config = getMailerConfig(activeSettings);
  const adminRecipients = config.adminEmails;

  if (!adminRecipients.length) {
    console.warn(`[Mailer] ⚠️ Aucun email administrateur configuré pour la commande #${order.order_number}`);
    return false;
  }

  const adminTemplate = activeSettings?.email_template_order_admin || DEFAULT_ADMIN_EMAIL_TEMPLATE;
  const adminSubject = activeSettings?.email_subject_order_admin || DEFAULT_ADMIN_SUBJECT;

  const subject = interpolateTemplate(adminSubject, order);
  const html = interpolateTemplate(adminTemplate, order);

  const result = await sendEmail({
    to: adminRecipients,
    replyTo: order.customer_email || undefined,
    subject,
    html,
    emailType: 'order_notification_admin',
    orderNumber: order.order_number,
    orderId: order.id,
    force: options?.force,
    settings: activeSettings,
  });

  return result.success;
}

/**
 * Send both customer confirmation and admin notification independently.
 */
export async function sendAllOrderNotifications(
  order: Order,
  settings?: StoreSettings | null,
  options?: { force?: boolean }
): Promise<{
  customer: { success: boolean; error?: string };
  admin: { success: boolean; error?: string };
}> {
  let activeSettings = settings;
  if (!activeSettings) {
    try {
      activeSettings = await getStoreSettings();
    } catch {}
  }

  const [customerRes, adminRes] = await Promise.allSettled([
    sendOrderConfirmationEmail(order, activeSettings, options),
    sendOrderAdminNotificationEmail(order, activeSettings, options),
  ]);

  return {
    customer: {
      success: customerRes.status === 'fulfilled' && customerRes.value,
      error: customerRes.status === 'rejected' ? String(customerRes.reason) : undefined,
    },
    admin: {
      success: adminRes.status === 'fulfilled' && adminRes.value,
      error: adminRes.status === 'rejected' ? String(adminRes.reason) : undefined,
    },
  };
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  code,
  userName = 'Administrator',
}: {
  to: string;
  resetUrl: string;
  code: string;
  userName?: string;
}): Promise<boolean> {
  const subject = `GudPreiss — Passwort zurücksetzen (Sicherheitscode: ${code})`;
  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwort zurücksetzen</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="padding: 35px 40px 25px 40px; text-align: center; border-bottom: 1px solid #334155; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);">
              <div style="display: inline-block; padding: 8px 16px; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 100px; margin-bottom: 15px;">
                <span style="color: #10b981; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">SICHERHEITSZENTRALE</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Gud<span style="color: #10b981;">Preiss</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 40px;">
              <h2 style="margin: 0 0 15px 0; color: #f8fafc; font-size: 20px; font-weight: 800;">Passwort zurücksetzen</h2>
              <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Hallo <strong>${userName}</strong>,<br>
                wir haben eine Anfrage erhalten, das Passwort für Ihr GudPreiss-Konto (<strong>${to}</strong>) zurückzusetzen.
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); text-transform: uppercase;">
                      Passwort jetzt ändern
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; text-align: center; margin: 30px 0 20px 0;">
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  Einmal-Sicherheitscode
                </p>
                <div style="color: #34d399; font-size: 32px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">
                  ${code}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 25px 40px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center; color: #64748b; font-size: 11px;">
              GudPreiss E-Commerce Deutschland • kontakt@gudpreiss.de
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const result = await sendEmail({
    to,
    subject,
    html,
    emailType: 'password_reset',
    force: true,
  });

  return result.success;
}

/**
 * Diagnostic utility: send a live test email to verify SMTP / API configuration.
 */
export async function testEmailConfiguration(
  testRecipient: string,
  settings?: StoreSettings | null
): Promise<{
  success: boolean;
  transport: 'smtp' | 'resend' | 'none';
  message: string;
  errorDetails?: string;
  configSnapshot: {
    smtpConfigured: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    resendConfigured: boolean;
    adminRecipients: string[];
  };
}> {
  const config = getMailerConfig(settings);

  const configSnapshot = {
    smtpConfigured: config.smtp.isConfigured,
    smtpHost: config.smtp.host || '(nicht konfiguriert)',
    smtpPort: config.smtp.port,
    smtpUser: config.smtp.user ? `${config.smtp.user.slice(0, 3)}***` : '(nicht konfiguriert)',
    resendConfigured: config.resend.isConfigured,
    adminRecipients: config.adminEmails,
  };

  if (!testRecipient || !testRecipient.includes('@')) {
    return {
      success: false,
      transport: 'none',
      message: 'Bitte geben Sie eine gültige Test-E-Mail-Adresse ein.',
      errorDetails: 'Invalid email address provided',
      configSnapshot,
    };
  }

  const subject = `[GudPreiss] Test-E-Mail Systemdiagnose (${new Date().toLocaleTimeString('de-DE')})`;
  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>GudPreiss Test-E-Mail</title></head>
<body style="font-family: sans-serif; background: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
    <h2 style="color: #059669; margin-top: 0;">✓ E-Mail-Konfigurationstest erfolgreich!</h2>
    <p>Diese Test-E-Mail bestätigt, dass das E-Mail-System von <strong>GudPreiss</strong> ordnungsgemäß funktioniert.</p>
    <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px; margin: 15px 0;">
      <p style="margin: 4px 0;"><strong>Empfänger:</strong> ${testRecipient}</p>
      <p style="margin: 4px 0;"><strong>Zeitpunkt:</strong> ${new Date().toISOString()}</p>
      <p style="margin: 4px 0;"><strong>Aktive Methode:</strong> ${config.smtp.isConfigured ? 'SMTP-Server' : 'Resend API'}</p>
    </div>
    <p style="font-size: 12px; color: #64748b;">GudPreiss E-Commerce Benachrichtigungsdienst.</p>
  </div>
</body>
</html>
  `;

  const result = await sendEmail({
    to: testRecipient,
    subject,
    html,
    emailType: 'test_email',
    force: true,
  });

  if (result.success) {
    return {
      success: true,
      transport: result.transport,
      message: `Test-E-Mail erfolgreich via ${result.transport.toUpperCase()} an ${testRecipient} gesendet! (ID: ${result.messageId || 'ok'})`,
      configSnapshot,
    };
  } else {
    return {
      success: false,
      transport: result.transport,
      message: `Fehler beim Senden der Test-E-Mail via ${result.transport.toUpperCase()}`,
      errorDetails: result.error,
      configSnapshot,
    };
  }
}

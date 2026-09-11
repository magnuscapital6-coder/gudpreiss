import { Order, StoreSettings } from '@/types';
import {
  DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
  DEFAULT_ADMIN_EMAIL_TEMPLATE,
  DEFAULT_CUSTOMER_SUBJECT,
  DEFAULT_ADMIN_SUBJECT,
  interpolateTemplate,
} from './templates';

/**
 * Get email templates from store settings, falling back to defaults.
 */
function getTemplates(settings?: StoreSettings | null) {
  return {
    customerTemplate: settings?.email_template_order_customer || DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
    adminTemplate: settings?.email_template_order_admin || DEFAULT_ADMIN_EMAIL_TEMPLATE,
    customerSubject: settings?.email_subject_order_customer || DEFAULT_CUSTOMER_SUBJECT,
    adminSubject: settings?.email_subject_order_admin || DEFAULT_ADMIN_SUBJECT,
  };
}

/**
 * Return a guaranteed verified sender address for GudPreiss.
 */
function getVerifiedSender(alias: string = 'kontakt'): string {
  const envFrom = process.env.EMAIL_FROM;
  if (envFrom && envFrom.includes('@gudpreiss.de')) {
    return envFrom;
  }
  return `GudPreiss <${alias}@gudpreiss.de>`;
}

/**
 * Send order confirmation email to the customer.
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  settings?: StoreSettings | null
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey.includes('demo')) {
    console.warn(`[Email] RESEND_API_KEY manquant ou demo - email non envoye pour #${order.order_number}`);
    return false;
  }

  try {
    const fromAddress = getVerifiedSender('kontakt');
    const { customerTemplate, customerSubject } = getTemplates(settings);

    const subject = interpolateTemplate(customerSubject, order);
    const html = interpolateTemplate(customerTemplate, order);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [order.customer_email],
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`[Email] Confirmation #${order.order_number} envoyee a ${order.customer_email}`);
      return true;
    } else {
      const err = await res.json();
      console.error(`[Email] Echec confirmation #${order.order_number}:`, err.message || JSON.stringify(err));
      return false;
    }
  } catch (err) {
    console.error(`[Email] Erreur reseau confirmation #${order.order_number}:`, err);
    return false;
  }
}

/**
 * Send new order notification email to the admin.
 */
export async function sendOrderAdminNotificationEmail(
  order: Order,
  settings?: StoreSettings | null
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey.includes('demo')) {
    console.warn(`[Email] RESEND_API_KEY manquant ou demo - notification admin non envoyee pour #${order.order_number}`);
    return false;
  }

  try {
    // Use bestellungen@gudpreiss.de to prevent anti-spoofing drop when delivering to kontakt@gudpreiss.de
    const fromAddress = 'GudPreiss System <bestellungen@gudpreiss.de>';
    
    // Collect all admin notification emails (deduplicated)
    const primaryAdmin = settings?.contact_email || 'kontakt@gudpreiss.de';
    const fallbackAdmins = [
      primaryAdmin,
      'kontakt@gudpreiss.de',
      process.env.SUPPORT_EMAIL,
      process.env.ADMIN_NOTIFICATION_EMAIL,
    ].filter((e): e is string => Boolean(e && e.includes('@')));

    const adminRecipients = Array.from(new Set(fallbackAdmins));

    const { adminTemplate, adminSubject } = getTemplates(settings);
    const subject = interpolateTemplate(adminSubject, order);
    const html = interpolateTemplate(adminTemplate, order);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: adminRecipients,
        reply_to: order.customer_email || undefined,
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`[Email] Notification admin #${order.order_number} envoyee avec succes a:`, adminRecipients.join(', '));
      return true;
    } else {
      const err = await res.json();
      console.error(`[Email] Echec notification admin #${order.order_number}:`, err.message || JSON.stringify(err));
      return false;
    }
  } catch (err) {
    console.error(`[Email] Erreur reseau notification admin #${order.order_number}:`, err);
    return false;
  }
}

/**
 * Send password reset email to Admin (or user).
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
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey.includes('demo')) {
    console.warn(`[Email] RESEND_API_KEY manquant ou demo - reset password non envoye a ${to}`);
    return false;
  }

  try {
    const fromAddress = 'GudPreiss Sicherheit <sicherheit@gudpreiss.de>';
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
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 35px 40px 25px 40px; text-align: center; border-bottom: 1px solid #334155; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);">
              <div style="display: inline-block; padding: 8px 16px; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 100px; margin-bottom: 15px;">
                <span style="color: #10b981; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">SICHERHEITSZENTRALE</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Gud<span style="color: #10b981;">Preiss</span></h1>
              <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 13px;">E-Commerce Deutschland • Berlin</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 40px;">
              <h2 style="margin: 0 0 15px 0; color: #f8fafc; font-size: 20px; font-weight: 800;">Passwort zurücksetzen</h2>
              <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Hallo <strong>${userName}</strong>,<br>
                wir haben eine Anfrage erhalten, das Passwort für Ihr GudPreiss-Konto (<strong>${to}</strong>) zurückzusetzen.
              </p>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Passwort jetzt ändern
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 6-digit Code Alternative -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; text-align: center; margin: 30px 0 20px 0;">
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  Oder Einmal-Sicherheitscode eingeben
                </p>
                <div style="color: #34d399; font-size: 32px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">
                  ${code}
                </div>
              </div>

              <!-- Security Notice -->
              <p style="margin: 20px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                ⏱ <strong>Gültigkeitsdauer:</strong> Dieser Link und der Sicherheitscode sind <strong>30 Minuten</strong> gültig.<br>
                🛡 <strong>Sicherheitshinweis:</strong> Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail. Ihr Passwort bleibt unverändert.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 40px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.5;">
                <strong>GudPreiss E-Commerce Deutschland</strong><br>
                Friedrichstraße 123, 10117 Berlin, Deutschland<br>
                Kundenservice & Sicherheit: <a href="mailto:kontakt@gudpreiss.de" style="color: #10b981; text-decoration: none;">kontakt@gudpreiss.de</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`[Email] Password reset email envoye avec succes a: ${to}`);
      return true;
    } else {
      // Fallback try with default verified sender if custom alias has restriction
      const fallbackFrom = 'GudPreiss <kontakt@gudpreiss.de>';
      const fallbackRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fallbackFrom,
          to: [to],
          subject,
          html,
        }),
      });

      if (fallbackRes.ok) {
        console.log(`[Email] Password reset email envoye via fallback kontakt@gudpreiss.de a: ${to}`);
        return true;
      }

      const err = await res.json();
      console.error(`[Email] Echec envoi reset password a ${to}:`, err);
      return false;
    }
  } catch (err) {
    console.error(`[Email] Erreur reseau envoi reset password a ${to}:`, err);
    return false;
  }
}

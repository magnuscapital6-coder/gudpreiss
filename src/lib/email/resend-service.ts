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
    const fromAddress = process.env.EMAIL_FROM || 'GudPreiss <bestaetigung@gudpreiss.de>';
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
    const fromAddress = process.env.EMAIL_FROM || 'GudPreiss <bestaetigung@gudpreiss.de>';
    const adminEmail = settings?.contact_email || process.env.SUPPORT_EMAIL || 'kontakt@gudpreiss.de';
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
        to: [adminEmail],
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`[Email] Notification admin #${order.order_number} envoyee a ${adminEmail}`);
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

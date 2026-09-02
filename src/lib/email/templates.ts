import { Order } from '@/types';

/**
 * Default email templates for order notifications.
 * These can be customized from the admin panel.
 * Use {{variable}} syntax for interpolation.
 */

export const DEFAULT_CUSTOMER_EMAIL_TEMPLATE = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
  <h2 style="color: #059669;">Vielen Dank für Ihre Bestellung bei GudPreiss!</h2>
  <p>Hallo <strong>{{customer_name}}</strong>,</p>
  <p>Ihre Bestellung <strong>#{{order_number}}</strong> wurde erfolgreich erfasst.</p>
  
  <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
    <h3 style="margin-top: 0; color: #0f172a;">Zahlungsinformationen (Überweisung)</h3>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Empfänger:</strong> {{bank_holder}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>IBAN:</strong> {{iban}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>BIC:</strong> {{bic}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Verwendungszweck:</strong> {{order_number}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Gesamtbetrag:</strong> {{total_amount}} €</p>
  </div>

  <h3>Bestellte Artikel ({{item_count}})</h3>
  <ul style="padding-left: 20px;">
    {{items_list}}
  </ul>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
  <p style="font-size: 12px; color: #64748b;">Bei Fragen zu Ihrer Bestellung erreichen Sie uns unter {{support_email}}.</p>
</div>
`;

export const DEFAULT_ADMIN_EMAIL_TEMPLATE = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
  <h2 style="color: #059669;">Neue Bestellung eingegangen!</h2>
  <p>Eine neue Bestellung wurde auf <strong>GudPreiss</strong> aufgegeben.</p>
  
  <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #bbf7d0;">
    <h3 style="margin-top: 0; color: #0f172a;">Bestelldetails</h3>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Bestellnummer:</strong> #{{order_number}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Kunde:</strong> {{customer_name}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>E-Mail:</strong> {{customer_email}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Telefon:</strong> {{customer_phone}}</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Gesamtbetrag:</strong> {{total_amount}} €</p>
    <p style="font-size: 13px; margin: 4px 0;"><strong>Zahlungsmethode:</strong> {{payment_method}}</p>
  </div>

  <h3>Lieferadresse</h3>
  <p style="font-size: 13px; white-space: pre-line;">{{shipping_address}}</p>

  <h3>Bestellte Artikel ({{item_count}})</h3>
  <ul style="padding-left: 20px;">
    {{items_list}}
  </ul>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
  <p style="font-size: 12px; color: #64748b;">Diese E-Mail wurde automatisch vom GudPreiss-System gesendet.</p>
</div>
`;

export const DEFAULT_CUSTOMER_SUBJECT = 'Bestellbestätigung #{{order_number}} — GudPreiss';
export const DEFAULT_ADMIN_SUBJECT = 'Neue Bestellung #{{order_number}} — GudPreiss';

/**
 * Interpolate a template with order data.
 * Replaces {{variable}} placeholders with actual values.
 */
export function interpolateTemplate(template: string, order: Order): string {
  const customerName = order.shipping_address?.full_name || 'Kunde';
  const itemsList = order.items
    .map(
      (item) =>
        `<li><strong>${item.product_name}</strong> (${item.quantity}x) — ${(item.unit_price * item.quantity).toFixed(2)} €</li>`
    )
    .join('');

  const shippingAddr = order.shipping_address
    ? `${order.shipping_address.full_name || ''}\n${order.shipping_address.address_line1 || ''}\n${order.shipping_address.postal_code || ''} ${order.shipping_address.city || ''}\n${order.shipping_address.country || 'Deutschland'}`
    : 'Nicht angegeben';

  const variables: Record<string, string> = {
    order_number: order.order_number,
    customer_name: customerName,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone || 'Nicht angegeben',
    total_amount: order.total_amount.toFixed(2),
    subtotal: order.subtotal.toFixed(2),
    discount_amount: (order.discount_amount || 0).toFixed(2),
    shipping_fee: (order.shipping_fee || 0).toFixed(2),
    tax_amount: (order.tax_amount || 0).toFixed(2),
    payment_method: order.payment_method === 'bank_transfer' ? 'Banküberweisung' : order.payment_method,
    item_count: String(order.items.length),
    items_list: itemsList,
    shipping_address: shippingAddr,
    iban: order.bank_transfer_iban || 'DE89 3704 0044 0532 0130 00',
    bic: order.bank_transfer_bic || 'DEUTDEDDBER',
    bank_holder: order.bank_transfer_holder || 'GudPreiss GmbH',
    support_email: process.env.SUPPORT_EMAIL || 'kontakt@gudpreiss.de',
    store_name: 'GudPreiss',
  };

  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

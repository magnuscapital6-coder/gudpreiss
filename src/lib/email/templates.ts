import { Order } from '@/types';
import { DEFAULT_STORE_SETTINGS } from '@/lib/db/initial-data';

/**
 * Modern, responsive email templates for GudPreiss E-Commerce.
 * Tested across desktop and mobile clients (Gmail, Apple Mail, Outlook, etc.).
 * Placeholders are enclosed in {{variable}} syntax.
 */

export const DEFAULT_CUSTOMER_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bestellbestätigung #{{order_number}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 30px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 100px; margin-bottom: 12px;">
                <span style="color: #34d399; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">BESTELLBESTÄTIGUNG</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Gud<span style="color: #10b981;">Preiss</span></h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Offizieller E-Commerce Store Deutschland</p>
            </td>
          </tr>

          <!-- SUCCESS BANNER -->
          <tr>
            <td style="background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 700;">
                ✓ Vielen Dank für Ihren Einkauf! Ihre Bestellung ist eingegangen.
              </p>
            </td>
          </tr>

          <!-- MAIN BODY -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">
                Hallo <strong>{{customer_name}}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569;">
                wir haben Ihre Bestellung <strong>#{{order_number}}</strong> vom <strong>{{order_date}}</strong> erfolgreich erfasst. Nachfolgend finden Sie alle Details zu Ihrem Auftrag sowie die Zahlungsinformationen.
              </p>

              <!-- ORDER STATUS & NUMBER CARD -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 2px;">Bestellnummer</span>
                          <span style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace;">#{{order_number}}</span>
                        </td>
                        <td align="right">
                          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 2px;">Status</span>
                          <span style="display: inline-block; padding: 4px 10px; background-color: #dbeafe; color: #1e40af; border-radius: 6px; font-size: 12px; font-weight: 800;">{{order_status_label}}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PAYMENT INSTRUCTIONS (BANK TRANSFER) -->
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 22px; border-radius: 14px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 14px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.5px;">🏦 Zahlung per Banküberweisung</span>
                </div>
                <p style="margin: 0 0 14px 0; font-size: 13px; color: #cbd5e1;">
                  Bitte überweisen Sie den Gesamtbetrag von <strong>{{total_amount}} €</strong> unter Angabe des Verwendungszwecks auf folgendes Bankkonto:
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #e2e8f0; background: rgba(255,255,255,0.06); border-radius: 8px; padding: 12px;">
                  <tr>
                    <td style="padding: 4px 8px; color: #94a3b8; width: 35%;">Empfänger:</td>
                    <td style="padding: 4px 8px; font-weight: 700; color: #ffffff;">{{bank_holder}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 8px; color: #94a3b8;">IBAN:</td>
                    <td style="padding: 4px 8px; font-weight: 800; color: #34d399; font-family: monospace;">{{iban}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 8px; color: #94a3b8;">BIC / SWIFT:</td>
                    <td style="padding: 4px 8px; font-weight: 700; color: #ffffff; font-family: monospace;">{{bic}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 8px; color: #94a3b8;">Bank:</td>
                    <td style="padding: 4px 8px; font-weight: 700; color: #ffffff;">{{bank_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 8px; color: #94a3b8;">Verwendungszweck:</td>
                    <td style="padding: 4px 8px; font-weight: 900; color: #fbbf24; font-family: monospace;">{{order_number}}</td>
                  </tr>
                </table>
              </div>

              <!-- ORDERED ITEMS -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                Bestellte Artikel ({{item_count}})
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <th align="left" style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Artikel</th>
                    <th align="center" style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; width: 60px;">Menge</th>
                    <th align="right" style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; width: 90px;">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {{items_html_table}}
                </tbody>
              </table>

              <!-- TOTALS SUMMARY -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Zwischensumme:</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">{{subtotal}} €</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Versandkosten (Standard DHL):</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">{{shipping_fee_label}}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Rabatt:</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #10b981;">-{{discount_amount}} €</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Inkl. 19% MwSt.:</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #64748b;">{{tax_amount}} €</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 6px;"></td>
                </tr>
                <tr>
                  <td style="font-size: 16px; font-weight: 900; color: #0f172a;">Gesamtbetrag (inkl. MwSt.):</td>
                  <td align="right" style="font-size: 18px; font-weight: 900; color: #059669;">{{total_amount}} €</td>
                </tr>
              </table>

              <!-- SHIPPING ADDRESS -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 8px;">Lieferadresse</span>
                    <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5; white-space: pre-line;">{{shipping_address}}</p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;"><strong>Telefon:</strong> {{customer_phone}}</p>
                  </td>
                </tr>
              </table>

              <!-- SUPPORT & HELP -->
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-align: center;">
                Haben Sie Fragen zu Ihrer Bestellung? Wir helfen Ihnen gerne weiter!
              </p>
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #059669; text-align: center;">
                E-Mail: <a href="mailto:{{support_email}}" style="color: #059669; text-decoration: none;">{{support_email}}</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #0f172a; padding: 25px 30px; text-align: center; color: #64748b; font-size: 12px;">
              <p style="margin: 0 0 6px 0; color: #94a3b8; font-weight: 700;">GudPreiss E-Commerce Deutschland</p>
              <p style="margin: 0 0 10px 0;">Friedrichstraße 123, 10117 Berlin, Deutschland</p>
              <p style="margin: 0; font-size: 11px; color: #475569;">© {{year}} GudPreiss. Alle Rechte vorbehalten.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const DEFAULT_ADMIN_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neue Bestellung #{{order_number}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #334155;">
          
          <!-- ADMIN HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #022c22 0%, #064e3b 100%); padding: 30px; text-align: center; border-bottom: 1px solid #059669;">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; border-radius: 100px; margin-bottom: 10px;">
                <span style="color: #6ee7b7; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">ADMIN NOTIFIKATION</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">🛒 Neue Bestellung #{{order_number}}</h1>
              <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 14px; font-weight: 700;">Betrag: {{total_amount}} € • {{item_count}} Artikel</p>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td style="padding: 30px;">

              <!-- ACTION BUTTON TO ADMIN DASHBOARD -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td align="center">
                    <a href="{{admin_order_url}}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      Bestellung im Admin-Panel öffnen →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- CUSTOMER INFO CARD -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1px;">
                  👤 Kundendaten & Kontakt
                </h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #cbd5e1;">
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8; width: 35%;">Name:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #ffffff;">{{customer_name}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">E-Mail:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #60a5fa;"><a href="mailto:{{customer_email}}" style="color: #60a5fa; text-decoration: none;">{{customer_email}}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Telefon:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #ffffff;">{{customer_phone}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Zahlungsart:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #fbbf24;">{{payment_method}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Zahlungsstatus:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #a7f3d0;">{{payment_status}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Datum:</td>
                    <td style="padding: 4px 0; color: #ffffff;">{{order_date}}</td>
                  </tr>
                </table>
              </div>

              <!-- SHIPPING ADDRESS CARD -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1px;">
                  📦 Lieferadresse
                </h3>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.5; white-space: pre-line;">{{shipping_address}}</p>
              </div>

              <!-- ORDER ITEMS -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1px;">
                  🛍 Bestellte Artikel ({{item_count}})
                </h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #cbd5e1;">
                  {{items_admin_table}}
                </table>
              </div>

              <!-- TOTAL SUMMARY -->
              <div style="background-color: #064e3b; border: 1px solid #059669; border-radius: 12px; padding: 16px 20px; text-align: right;">
                <span style="font-size: 13px; color: #a7f3d0; margin-right: 15px;">Gesamtbetrag der Bestellung:</span>
                <span style="font-size: 20px; font-weight: 900; color: #ffffff;">{{total_amount}} €</span>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #1e293b;">
              <p style="margin: 0;">Automatisches Benachrichtigungssystem • GudPreiss E-Commerce</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const DEFAULT_CUSTOMER_SUBJECT = 'Bestellbestätigung #{{order_number}} — GudPreiss';
export const DEFAULT_ADMIN_SUBJECT = '🚨 Neue Bestellung eingegangen: #{{order_number}} ({{total_amount}} €)';

/**
 * Interpolate email templates with full order data and formatting.
 */
export function interpolateTemplate(template: string, order: Order, appUrl?: string): string {
  const customerName =
    order.shipping_address?.full_name || (order as any).customer_name || 'Geschätzter Kunde';

  const items = order.items || [];
  const itemsCount = items.length;

  // Render responsive HTML table rows for customer
  const itemsHtmlTable = items
    .map((item: any, idx: number) => {
      const unitPrice = Number(item.unit_price ?? item.price ?? 0);
      const qty = Number(item.quantity || 1);
      const rowTotal = (unitPrice * qty).toFixed(2);
      const name = item.product_name || item.name || 'Artikel';
      const sku = item.sku ? `<span style="font-size: 11px; color: #94a3b8; display: block;">SKU: ${item.sku}</span>` : '';
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      return `
        <tr style="background-color: ${bg}; border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 14px; font-size: 13px; color: #1e293b;">
            <strong>${name}</strong>
            ${sku}
          </td>
          <td align="center" style="padding: 12px 14px; font-size: 13px; color: #475569; font-weight: 700;">${qty}</td>
          <td align="right" style="padding: 12px 14px; font-size: 13px; color: #0f172a; font-weight: 800;">${rowTotal} €</td>
        </tr>
      `;
    })
    .join('');

  // Render admin items table rows
  const itemsAdminTable = items
    .map((item: any) => {
      const unitPrice = Number(item.unit_price ?? item.price ?? 0).toFixed(2);
      const qty = Number(item.quantity || 1);
      const rowTotal = (Number(unitPrice) * qty).toFixed(2);
      const name = item.product_name || item.name || 'Artikel';
      const sku = item.sku ? ` (${item.sku})` : '';

      return `
        <tr style="border-bottom: 1px solid #334155;">
          <td style="padding: 8px 0; color: #e2e8f0;"><strong>${name}</strong>${sku}</td>
          <td align="center" style="padding: 8px 0; color: #94a3b8; width: 60px;">${qty}x</td>
          <td align="right" style="padding: 8px 0; font-weight: 700; color: #34d399; width: 90px;">${rowTotal} €</td>
        </tr>
      `;
    })
    .join('');

  const shippingAddr = order.shipping_address
    ? `${order.shipping_address.full_name || ''}\n${order.shipping_address.address_line1 || ''}\n${order.shipping_address.postal_code || ''} ${order.shipping_address.city || ''}\n${order.shipping_address.country || 'Deutschland'}`.trim()
    : 'Lieferadresse wird separat übermittelt';

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('de-DE');

  const shippingFeeNum = Number(order.shipping_fee ?? (order as any).shipping_cost ?? 0);
  const shippingFeeLabel = shippingFeeNum <= 0 ? 'Kostenlos (0,00 €)' : `${shippingFeeNum.toFixed(2)} €`;

  const baseUrl = appUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de';
  const adminOrderUrl = `${baseUrl}/admin/orders?search=${encodeURIComponent(order.order_number)}`;

  const variables: Record<string, string> = {
    order_number: order.order_number || '',
    order_date: orderDate,
    customer_name: customerName,
    customer_email: order.customer_email || '',
    customer_phone: order.customer_phone || 'Nicht angegeben',
    total_amount: Number(order.total_amount || 0).toFixed(2),
    subtotal: Number(order.subtotal || 0).toFixed(2),
    discount_amount: Number(order.discount_amount || 0).toFixed(2),
    shipping_fee: shippingFeeNum.toFixed(2),
    shipping_fee_label: shippingFeeLabel,
    tax_amount: Number(order.tax_amount || 0).toFixed(2),
    payment_method:
      order.payment_method === 'bank_transfer'
        ? 'Banküberweisung (Vorkasse)'
        : order.payment_method || 'Banküberweisung',
    payment_status: order.payment_status || 'Warten auf Zahlungseingang',
    order_status: order.order_status || 'in Bearbeitung',
    order_status_label: 'In Bearbeitung',
    item_count: String(itemsCount),
    items_table: itemsHtmlTable,
    items_html_table: itemsHtmlTable,
    items_admin_table: itemsAdminTable,
    items_list: itemsAdminTable,
    items: itemsAdminTable,
    shipping_address: shippingAddr,
    customer_address: shippingAddr,
    delivery_address: shippingAddr,
    iban: order.bank_transfer_iban || DEFAULT_STORE_SETTINGS.iban || 'DE44 5001 0517 5422 3901 12',
    bic: order.bank_transfer_bic || DEFAULT_STORE_SETTINGS.bic || 'INGDDEFFXXX',
    bank_name: DEFAULT_STORE_SETTINGS.bank_name || 'ING-DiBa AG',
    bank_holder:
      order.bank_transfer_holder ||
      DEFAULT_STORE_SETTINGS.account_holder ||
      'GudPreiss E-Commerce Deutschland',
    account_holder:
      order.bank_transfer_holder ||
      DEFAULT_STORE_SETTINGS.account_holder ||
      'GudPreiss E-Commerce Deutschland',
    total: Number(order.total_amount || 0).toFixed(2),
    support_email: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'kontakt@gudpreiss.de',
    admin_order_url: adminOrderUrl,
    store_name: 'GudPreiss',
    year: String(new Date().getFullYear()),
  };

  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

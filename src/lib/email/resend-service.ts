import { Order } from '@/types';

/**
 * Sends a real order confirmation email via Resend REST API
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey.includes('demo')) {
    console.log(`[Order Email Simulation] Order confirmation #${order.order_number} created for ${order.customer_email}`);
    return false;
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || 'GudPreiss <bestaetigung@gudpreiss.de>';
    const supportEmail = process.env.SUPPORT_EMAIL || 'kontakt@gudpreiss.de';

    const emailSubject = `Bestellbestätigung #${order.order_number} — GudPreiss`;
    const emailBodyHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #059669;">Vielen Dank für Ihre Bestellung bei GudPreiss!</h2>
        <p>Hallo <strong>${order.shipping_address?.full_name || 'Kunde'}</strong>,</p>
        <p>Ihre Bestellung <strong>#${order.order_number}</strong> wurde erfolgreich erfasst.</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #0f172a;">Zahlungsinformationen (Überweisung)</h3>
          <p style="font-size: 13px; margin: 4px 0;"><strong>Empfänger:</strong> ${order.bank_transfer_holder || 'GudPreiss GmbH'}</p>
          <p style="font-size: 13px; margin: 4px 0;"><strong>IBAN:</strong> ${order.bank_transfer_iban || 'DE89 3704 0044 0532 0130 00'}</p>
          <p style="font-size: 13px; margin: 4px 0;"><strong>BIC:</strong> ${order.bank_transfer_bic || 'DEUTDEDDBER'}</p>
          <p style="font-size: 13px; margin: 4px 0;"><strong>Verwendungszweck:</strong> ${order.order_number}</p>
          <p style="font-size: 13px; margin: 4px 0;"><strong>Gesamtbetrag:</strong> ${order.total_amount.toFixed(2)} €</p>
        </div>

        <h3>Bestellte Artikel (${order.items.length})</h3>
        <ul style="padding-left: 20px;">
          ${order.items.map(item => `<li><strong>${item.product_name}</strong> (${item.quantity}x) — ${(item.unit_price * item.quantity).toFixed(2)} €</li>`).join('')}
        </ul>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Bei Fragen zu Ihrer Bestellung erreichen Sie uns unter ${supportEmail}.</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [order.customer_email, supportEmail],
        subject: emailSubject,
        html: emailBodyHTML,
      }),
    });

    if (res.ok) {
      console.log(`[Resend Order Email Success] Confirmation for #${order.order_number} sent to ${order.customer_email}`);
      return true;
    } else {
      const err = await res.json();
      console.warn('[Resend Order Email Error]:', err);
      return false;
    }
  } catch (err) {
    console.error('[Resend Order Dispatch Error]:', err);
    return false;
  }
}

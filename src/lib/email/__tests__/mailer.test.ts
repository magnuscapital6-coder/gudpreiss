import { describe, it, expect } from 'vitest';
import {
  interpolateTemplate,
  DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
  DEFAULT_ADMIN_EMAIL_TEMPLATE,
  DEFAULT_CUSTOMER_SUBJECT,
  DEFAULT_ADMIN_SUBJECT,
} from '../templates';
import {
  hasEmailBeenSent,
  recordEmailPending,
  recordEmailResult,
  getRecentEmailLogs,
} from '../email-log-service';
import { getMailerConfig } from '../mailer-service';
import { Order } from '@/types';

describe('Email System & Templates', () => {
  const mockOrder: Order = {
    id: 'ord-test-123',
    order_number: 'GP-2026-9999',
    customer_email: 'kunde@example.de',
    customer_phone: '+49 157 31294173',
    shipping_address: {
      full_name: 'Max Mustermann',
      address_line1: 'Friedrichstraße 123',
      city: 'Berlin',
      postal_code: '10117',
      country: 'Deutschland',
      phone: '+49 157 31294173',
    },
    billing_address: {
      full_name: 'Max Mustermann',
      address_line1: 'Friedrichstraße 123',
      city: 'Berlin',
      postal_code: '10117',
      country: 'Deutschland',
      phone: '+49 157 31294173',
    },
    items: [
      {
        id: 'item-1',
        order_id: 'ord-test-123',
        product_id: 'prod-1',
        product_name: 'SCOTT Aspect eRIDE 930',
        sku: 'SCOTT-930',
        unit_price: 2499,
        quantity: 1,
        total_price: 2499,
      },
    ],
    subtotal: 2499,
    discount_amount: 0,
    shipping_fee: 0,
    tax_amount: 399,
    total_amount: 2499,
    payment_method: 'bank_transfer',
    payment_status: 'pending',
    order_status: 'processing',
    bank_transfer_iban: 'DE44 5001 0517 5422 3901 12',
    bank_transfer_bic: 'INGDDEFFXXX',
    bank_transfer_holder: 'GudPreiss E-Commerce Deutschland',
    created_at: '2026-09-11T10:00:00.000Z',
    updated_at: '2026-09-11T10:00:00.000Z',
  };

  it('interpolates customer email template correctly with all variables', () => {
    const rendered = interpolateTemplate(DEFAULT_CUSTOMER_EMAIL_TEMPLATE, mockOrder);

    expect(rendered).toContain('Max Mustermann');
    expect(rendered).toContain('GP-2026-9999');
    expect(rendered).toContain('2499.00 €');
    expect(rendered).toContain('SCOTT Aspect eRIDE 930');
    expect(rendered).toContain('DE44 5001 0517 5422 3901 12');
    expect(rendered).toContain('INGDDEFFXXX');
    expect(rendered).toContain('GudPreiss E-Commerce Deutschland');
    expect(rendered).toContain('Friedrichstraße 123');
  });

  it('interpolates admin email template correctly with order link', () => {
    const rendered = interpolateTemplate(DEFAULT_ADMIN_EMAIL_TEMPLATE, mockOrder);

    expect(rendered).toContain('GP-2026-9999');
    expect(rendered).toContain('Max Mustermann');
    expect(rendered).toContain('kunde@example.de');
    expect(rendered).toContain('2499.00 €');
    expect(rendered).toContain('/admin/orders?search=GP-2026-9999');
  });

  it('interpolates subject lines accurately', () => {
    const custSubject = interpolateTemplate(DEFAULT_CUSTOMER_SUBJECT, mockOrder);
    const adminSubject = interpolateTemplate(DEFAULT_ADMIN_SUBJECT, mockOrder);

    expect(custSubject).toBe('Bestellbestätigung #GP-2026-9999 — GudPreiss');
    expect(adminSubject).toContain('GP-2026-9999');
    expect(adminSubject).toContain('2499.00 €');
  });

  it('tracks email dispatch lifecycle and prevents duplicate sends (idempotency)', async () => {
    const orderNum = 'GP-TEST-IDEMPOTENCY-01';

    // 1. Initial check: not sent
    const before = await hasEmailBeenSent(orderNum, 'order_confirmation_customer');
    expect(before).toBe(false);

    // 2. Pending log
    const logId = await recordEmailPending({
      order_number: orderNum,
      email_type: 'order_confirmation_customer',
      recipient: 'test@example.com',
      subject: 'Test Subject',
      transport_used: 'smtp',
    });
    expect(logId).toBeTruthy();

    // Still not 'sent'
    expect(await hasEmailBeenSent(orderNum, 'order_confirmation_customer')).toBe(false);

    // 3. Mark as sent
    await recordEmailResult(logId, {
      status: 'sent',
      message_id: 'msg-test-12345',
    });

    // 4. Now hasEmailBeenSent should return true
    const after = await hasEmailBeenSent(orderNum, 'order_confirmation_customer');
    expect(after).toBe(true);

    // 5. Admin email is distinct and should still be false
    expect(await hasEmailBeenSent(orderNum, 'order_notification_admin')).toBe(false);

    // 6. Recent logs check
    const logs = await getRecentEmailLogs();
    const entry = logs.find((l) => l.id === logId);
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('sent');
    expect(entry?.message_id).toBe('msg-test-12345');
  });

  it('resolves mailer config and admin email recipients correctly', () => {
    const config = getMailerConfig();
    expect(config).toBeDefined();
    expect(config.adminEmails).toBeInstanceOf(Array);
    expect(config.adminEmails.length).toBeGreaterThan(0);
    expect(config.adminEmails).toContain('kontakt@gudpreiss.de');
  });
});

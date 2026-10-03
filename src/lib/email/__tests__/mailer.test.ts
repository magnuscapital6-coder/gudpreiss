import { describe, it, expect, afterEach } from 'vitest';
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
    // Unique per run so persisted DB logs from a previous execution don't bleed in
    const orderNum = `GP-TEST-IDEMPOTENCY-${Date.now()}`;

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

describe('SMTP transport negotiation', () => {
  const SMTP_ENV_KEYS = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_ENCRYPTION',
    'SMTP_SECURE',
    'RESEND_API_KEY',
  ] as const;

  const savedEnv: Record<string, string | undefined> = {};
  let initialised = false;

  function withEnv<T>(env: Record<string, string>, run: () => T): T {
    if (!initialised) {
      for (const key of SMTP_ENV_KEYS) savedEnv[key] = process.env[key];
      initialised = true;
    }
    for (const key of SMTP_ENV_KEYS) delete process.env[key];
    for (const [key, value] of Object.entries(env)) process.env[key] = value;
    try {
      return run();
    } finally {
      for (const key of SMTP_ENV_KEYS) delete process.env[key];
      for (const [key, value] of Object.entries(savedEnv)) {
        if (value !== undefined) process.env[key] = value;
      }
    }
  }

  const RELAY = { SMTP_HOST: 'smtp.ionos.de', SMTP_USER: 'kontakt@gudpreiss.de', SMTP_PASSWORD: 'secret' };

  afterEach(() => {
    for (const key of SMTP_ENV_KEYS) delete process.env[key];
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value !== undefined) process.env[key] = value;
    }
  });

  // Regression: `SMTP_ENCRYPTION=tls` used to set `secure: true`, which makes
  // nodemailer negotiate implicit TLS on port 587 and every relay rejects it.
  it('keeps port 587 on STARTTLS even when SMTP_ENCRYPTION is "tls"', () => {
    const config = withEnv({ ...RELAY, SMTP_PORT: '587', SMTP_ENCRYPTION: 'tls' }, () => getMailerConfig());
    expect(config.smtp.port).toBe(587);
    expect(config.smtp.secure).toBe(false);
    expect(config.smtp.isConfigured).toBe(true);
  });

  it('enables implicit TLS on port 465', () => {
    const config = withEnv({ ...RELAY, SMTP_PORT: '465', SMTP_ENCRYPTION: 'ssl' }, () => getMailerConfig());
    expect(config.smtp.secure).toBe(true);
  });

  it('enables implicit TLS on port 465 without SMTP_ENCRYPTION set', () => {
    const config = withEnv({ ...RELAY, SMTP_PORT: '465' }, () => getMailerConfig());
    expect(config.smtp.secure).toBe(true);
  });

  it('lets SMTP_SECURE=false explicitly override the port heuristic', () => {
    const config = withEnv({ ...RELAY, SMTP_PORT: '465', SMTP_SECURE: 'false' }, () => getMailerConfig());
    expect(config.smtp.secure).toBe(false);
  });

  it('lets SMTP_SECURE=true explicitly override the port heuristic', () => {
    const config = withEnv({ ...RELAY, SMTP_PORT: '587', SMTP_SECURE: 'true' }, () => getMailerConfig());
    expect(config.smtp.secure).toBe(true);
  });

  it('gives DB settings precedence over env vars', () => {
    const config = withEnv({ ...RELAY, SMTP_PORT: '587', SMTP_SECURE: 'true' }, () =>
      getMailerConfig({
        smtp_host: 'smtp.hostinger.com',
        smtp_port: 465,
        smtp_encryption: 'ssl',
        smtp_secure: true,
      } as never)
    );
    expect(config.smtp.secure).toBe(true);
  });

  it('treats a stringified "false" from JSON settings as false, not truthy', () => {
    const config = withEnv({ ...RELAY }, () =>
      getMailerConfig({ smtp_secure: 'false' } as never)
    );
    expect(config.smtp.secure).toBe(false);
  });

  it('ignores placeholder Resend keys so SMTP failover stays truthful', () => {
    const placeholder = withEnv({ ...RELAY, SMTP_PORT: '587', RESEND_API_KEY: 're_123456789' }, () =>
      getMailerConfig()
    );
    expect(placeholder.resend.isConfigured).toBe(false);

    const real = withEnv(
      { ...RELAY, SMTP_PORT: '587', RESEND_API_KEY: 're_4f3a9b2c7d1e8a6b5c0d9e8f7a6b5c4d' },
      () => getMailerConfig()
    );
    expect(real.resend.isConfigured).toBe(true);
  });
});

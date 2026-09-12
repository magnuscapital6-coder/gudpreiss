import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/* ------------------------------------------------------------------ */
/*  Env helpers                                                       */
/* ------------------------------------------------------------------ */
function env(key: string): string {
  const raw = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
  return (raw.match(new RegExp(`^${key}=["']?([^#\\r\\n"']*)`, 'm')) || [])[1]?.trim() || '';
}

const SUPABASE_URL = env('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY  = env('SUPABASE_SERVICE_ROLE_KEY');
const CUSTOMER_EMAIL = 'magnuscapital6@gmail.com';
const ADMIN_EMAIL    = env('ADMIN_NOTIFICATION_EMAIL') || 'kontakt@gudpreiss.de';

/** Supabase REST via Node global fetch (proven working vs Playwright request fixture). */
async function rest<T = any>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    cache: 'no-store',
  });
  const body = await res.text();
  expect(res.ok, `REST ${res.status} ${path} — ${body}`).toBe(true);
  return JSON.parse(body) as T[];
}

/** Poll REST until `predicate(rows)` returns true or timeout. */
async function poll<T = any>(
  path: string,
  predicate: (rows: T[]) => boolean,
  { timeout = 30_000, interval = 2_000 } = {},
): Promise<T[]> {
  const deadline = Date.now() + timeout;
  let lastRows: T[] = [];
  while (Date.now() < deadline) {
    lastRows = await rest<T>(path);
    if (predicate(lastRows)) return lastRows;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`poll(${path}) timed out after ${timeout}ms — last: ${JSON.stringify(lastRows)}`);
}

/* ------------------------------------------------------------------ */
/*  Cart seed data                                                    */
/* ------------------------------------------------------------------ */
const FAKE_PRODUCT = {
  id: 'e2e-email-test-product',
  name: 'E2E Test – Lautsprecher',
  slug: 'e2e-test-lautsprecher',
  description: 'Testprodukt für E2E Email-Prüfung.',
  short_description: 'Test',
  sku: 'GP-E2E-TEST',
  price: 49.99,
  compare_at_price: null,
  stock: 100,
  low_stock_threshold: 5,
  status: 'active' as const,
  featured: false,
  best_seller: false,
  new_arrival: false,
  on_sale: false,
  weight_kg: 1,
  rating: 0,
  review_count: 0,
  images: ['/images/products/10134redmi-a27u.png'],
  specifications: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const FAKE_CART_ITEM = {
  id: FAKE_PRODUCT.id,
  product_id: FAKE_PRODUCT.id,
  variant_id: undefined,
  product: FAKE_PRODUCT,
  quantity: 2,
};

/* ------------------------------------------------------------------ */
/*  Test                                                              */
/* ------------------------------------------------------------------ */
test.describe('Real E2E — Order Emails (SMTP + DB logs)', () => {
  test.setTimeout(180_000);

  test('creates order → customer + admin emails dispatched exactly once', async ({ page }) => {
    expect(SUPABASE_URL).toMatch(/^https:\/\//);
    expect(SERVICE_KEY.length).toBeGreaterThan(20);

    /* ---- 1. Seed cart via localStorage (before React mounts) ---- */
    await page.addInitScript((item) => {
      localStorage.setItem('gudpreiss_cart', JSON.stringify([item]));
      localStorage.removeItem('gudpreiss_coupon');
      localStorage.removeItem('gudpreiss_pending_checkout');
    }, FAKE_CART_ITEM);

    /* ---- 2. Checkout step 1 — contact ---- */
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 30_000 });
    await emailInput.fill(CUSTOMER_EMAIL);
    await page.locator('input[type="tel"]').fill('+49 157 12345678');
    await page.getByRole('button', { name: /Weiter zur Lieferung/i }).click();

    /* ---- 3. Checkout step 2 — shipping address ---- */
    await page.locator('input[placeholder="Max Mustermann"]').waitFor({ state: 'visible', timeout: 10_000 });
    await page.locator('input[placeholder="Max Mustermann"]').fill('E2E Testkäufer');
    await page.locator('input[placeholder="Musterstraße 123"]').fill('Teststraße 42');
    await page.locator('input[placeholder="Berlin"]').fill('Berlin');
    await page.locator('input[placeholder="10115"]').fill('10115');
    await page.getByRole('button', { name: /Weiter zur Zahlung/i }).click();

    /* ---- 4. Checkout step 3 — submit order ---- */
    const submitBtn = page.getByRole('button', { name: /BESTELLUNG BESTÄTIGEN/i });
    await submitBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await submitBtn.click();

    /* ---- 5. Wait for success page ---- */
    await page.waitForURL(/\/checkout\/success\?order_number=/, { timeout: 60_000 });
    const orderNumber = new URL(page.url()).searchParams.get('order_number');
    expect(orderNumber, 'order_number from URL').toMatch(/^GP-2026-\d{4}$/);

    /* Success page content check */
    await expect(page.locator('text=#' + orderNumber).first()).toBeVisible({ timeout: 10_000 });

    /* ---- 6. Verify order row in Supabase ---- */
    const [order] = await poll(`orders?order_number=eq.${orderNumber}&select=*`, (rows) => rows.length === 1);
    expect(order).toBeTruthy();
    expect(order.customer_email).toBe(CUSTOMER_EMAIL);

    /* ---- 7. Verify email_logs — exactly 2 rows, both sent ---- */
    const logs = await poll(
      `email_logs?order_number=eq.${orderNumber}&select=email_type,recipient,status`,
      (rows) => rows.length >= 2 && rows.every((r) => r.status === 'sent'),
    );

    expect(logs).toHaveLength(2);

    const customerLog = logs.find((r) => r.email_type === 'order_confirmation_customer');
    const adminLog    = logs.find((r) => r.email_type === 'order_notification_admin');

    expect(customerLog, 'customer email log').toBeTruthy();
    expect(customerLog!.recipient).toBe(CUSTOMER_EMAIL);
    expect(customerLog!.status).toBe('sent');

    expect(adminLog, 'admin email log').toBeTruthy();
    expect(adminLog!.recipient).toBe(ADMIN_EMAIL);
    expect(adminLog!.status).toBe('sent');

    /* ---- 8. Verify no duplicate logs for this order ---- */
    const allLogs = await rest(`email_logs?order_number=eq.${orderNumber}&select=email_type`);
    const count = (type: string) => allLogs.filter((r) => r.email_type === type).length;
    expect(count('order_confirmation_customer'), 'no duplicate customer email').toBe(1);
    expect(count('order_notification_admin'), 'no duplicate admin email').toBe(1);

    console.log(`\n✅ Order ${orderNumber} created — 2 emails sent (customer + admin) — 0 duplicates\n`);
  });
});

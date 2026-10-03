import { describe, it, expect, afterEach, vi } from 'vitest';
import { createOrderServerAction } from '@/app/actions/store-actions';

const payload = (email: string) => ({
  customer_email: email,
  customer_phone: '+49 157 31294173',
  shipping_address: {
    full_name: 'Collision Tester',
    address_line1: 'Teststraße 1',
    city: 'Berlin',
    postal_code: '10115',
    country: 'Deutschland',
    phone: '+49 157 31294173',
  },
  items: [
    {
      id: 'dupe-item-1',
      product_id: 'prod-dupe',
      product_name: 'Testartikel',
      sku: 'DUPE-1',
      unit_price: 100,
      quantity: 1,
      total_price: 100,
    },
  ],
  subtotal: 100,
  discount_amount: 0,
  shipping_cost: 0,
  tax_amount: 19,
  total_amount: 119,
  payment_method: 'bank_transfer',
});

describe('Order number uniqueness', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('never issues a duplicate order number to two different orders', async () => {
    const seen = new Set<string>();

    for (let i = 0; i < 60; i++) {
      const res = await createOrderServerAction(payload(`dupe-bulk-${i}@kund.de`));
      expect(res.success).toBe(true);
      const num = res.order!.order_number;
      expect(seen.has(num), `duplicate order number ${num} on iteration ${i}`).toBe(false);
      seen.add(num);
    }

    expect(seen.size).toBe(60);
  });

  it('redraws when Math.random is stuck, instead of reusing a taken number', async () => {
    // Math.random pinned: the first order claims the only candidate, so every
    // later order must escape to the crypto-derived fallback rather than
    // colliding with it.
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const first = await createOrderServerAction(payload('dupe-stuck-1@kund.de'));
    expect(first.success).toBe(true);
    const firstNumber = first.order!.order_number;
    expect(firstNumber).toBe('GP-2026-1000');

    for (let i = 0; i < 5; i++) {
      const res = await createOrderServerAction(payload(`dupe-stuck-${i + 2}@kund.de`));
      expect(res.success).toBe(true);
      expect(res.order!.order_number).not.toBe(firstNumber);
    }
  });

  it('keeps the GP-<year>-<digits> shape that order tracking relies on', async () => {
    const res = await createOrderServerAction(payload('dupe-shape@kund.de'));
    expect(res.success).toBe(true);
    expect(res.order!.order_number).toMatch(/^GP-\d{4}-\d{4,5}$/);
  });

  it('surfaces a failed insert as an error instead of a phantom order', async () => {
    // A RLS/permission rejection on orders must not be reported to the customer
    // as a confirmed order.
    const db = await import('@/lib/db/db-provider');
    vi.spyOn(db, 'createOrder').mockRejectedValue(new Error('42501 permission denied'));

    const res = await createOrderServerAction(payload('dupe-rls@kund.de'));
    expect(res.success).toBe(false);
    expect(res.order).toBeUndefined();
  });
});
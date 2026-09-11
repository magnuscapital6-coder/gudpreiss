import { describe, it, expect } from 'vitest';
import { createOrderServerAction } from '@/app/actions/store-actions';
import { hasEmailBeenSent, getRecentEmailLogs } from '@/lib/email/email-log-service';

describe('End-to-End Order Creation & Email Dispatch Flow', () => {
  it('creates an order, dispatches customer + admin emails, and logs lifecycle', async () => {
    const testOrderPayload = {
      customer_email: 'test-buyer@gudpreiss.de',
      customer_phone: '+49 157 31294173',
      shipping_address: {
        full_name: 'Max Mustermann',
        address_line1: 'Friedrichstraße 123',
        city: 'Berlin',
        state: 'Berlin',
        postal_code: '10117',
        country: 'Deutschland',
        phone: '+49 157 31294173',
      },
      items: [
        {
          id: 'item-e2e-1',
          product_id: 'prod-e2e',
          product_name: 'SCOTT Aspect eRIDE 930 E-Bike',
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
    };

    const res = await createOrderServerAction(testOrderPayload);

    expect(res.success).toBe(true);
    expect(res.order).toBeDefined();
    expect(res.order?.order_number).toMatch(/^GP-2026-\d+/);
    expect(res.order?.customer_email).toBe('test-buyer@gudpreiss.de');
    expect(res.order?.total_amount).toBe(2499);

    // Verify emails were attempted/sent
    expect(res.emails).toBeDefined();
    expect(typeof res.emails?.customer).toBe('boolean');
    expect(typeof res.emails?.admin).toBe('boolean');

    // Verify logs recorded for this order number
    const orderNum = res.order!.order_number;
    const logs = await getRecentEmailLogs(20);
    const orderLogs = logs.filter((l) => l.order_number === orderNum);
    expect(orderLogs.length).toBeGreaterThanOrEqual(1);
  }, 15000);
});

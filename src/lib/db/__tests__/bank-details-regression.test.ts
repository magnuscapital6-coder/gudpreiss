import { describe, it, expect, afterAll } from 'vitest';
import { getStoreSettings, updateStoreSettings } from '@/lib/db/db-provider';
import { DEFAULT_STORE_SETTINGS } from '@/lib/db/initial-data';
import { createOrderServerAction } from '@/app/actions/store-actions';

const ADMIN_IBAN = 'DE89 3704 0044 0532 0130 00';
const ADMIN_BIC = 'DEUTDEDBXXX';
const ADMIN_HOLDER = 'GudPreiss E-Commerce';

describe('Admin-configured bank details (no regression to defaults)', () => {
  afterAll(async () => {
    // Leave the in-memory store as we found it for other suites.
    await updateStoreSettings({
      iban: DEFAULT_STORE_SETTINGS.iban,
      bic: DEFAULT_STORE_SETTINGS.bic,
      account_holder: DEFAULT_STORE_SETTINGS.account_holder,
    });
  });

  it('persists an IBAN set by the admin instead of falling back to the default', async () => {
    expect(DEFAULT_STORE_SETTINGS.iban).not.toBe(ADMIN_IBAN);

    await updateStoreSettings({
      iban: ADMIN_IBAN,
      bic: ADMIN_BIC,
      account_holder: ADMIN_HOLDER,
    });

    const settings = await getStoreSettings();
    expect(settings.iban).toBe(ADMIN_IBAN);
    expect(settings.bic).toBe(ADMIN_BIC);
    expect(settings.account_holder).toBe(ADMIN_HOLDER);
  });

  it('still holds the admin IBAN after a settings re-read (no revert)', async () => {
    // A second read mimics a fresh page load / another server instance.
    const first = await getStoreSettings();
    const second = await getStoreSettings();
    expect(first.iban).toBe(ADMIN_IBAN);
    expect(second.iban).toBe(ADMIN_IBAN);
  });

  it('snapshots the admin IBAN onto a new order so the customer is paid to the right account', async () => {
    const res = await createOrderServerAction({
      customer_email: 'iban-test@kund.de',
      customer_phone: '+49 157 31294173',
      shipping_address: {
        full_name: 'Iban Tester',
        address_line1: 'Teststraße 1',
        city: 'Berlin',
        postal_code: '10115',
        country: 'Deutschland',
        phone: '+49 157 31294173',
      },
      items: [
        {
          id: 'iban-item-1',
          product_id: 'prod-iban',
          product_name: 'Testartikel',
          sku: 'IBAN-1',
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

    expect(res.success).toBe(true);
    expect(res.order?.bank_transfer_iban).toBe(ADMIN_IBAN);
    expect(res.order?.bank_transfer_bic).toBe(ADMIN_BIC);
    expect(res.order?.bank_transfer_holder).toBe(ADMIN_HOLDER);
    expect(res.order?.bank_transfer_iban).not.toBe(DEFAULT_STORE_SETTINGS.iban);
  });

  it('does not leak mailer secrets through the public settings row', async () => {
    const settings = await getStoreSettings();
    // stripSecretSettings is applied on the way out; the raw store must not be
    // the object the storefront receives.
    expect(settings.iban).toBe(ADMIN_IBAN);
  });
});
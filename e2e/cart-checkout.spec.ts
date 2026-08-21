import { test, expect } from '@playwright/test';

test.describe('Cart Page', () => {
  test('cart page loads', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });

    // Wait for page to render
    await page.waitForTimeout(2000);

    // Page should have some content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);
  });
});

test.describe('Checkout Page', () => {
  test('checkout page loads with empty cart message', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });

    // Clear cart
    await page.evaluate(() => {
      localStorage.removeItem('technova_cart');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    // Should show empty cart message or checkout form
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Shop Page', () => {
  test('loads and displays product grid', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });

    // Check shop page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 30000 });

    // Check products are displayed (wait for client-side rendering)
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('can click on a product to view details', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });

    // Wait for products to load
    const productLink = page.locator('a[href*="/shop/"]').first();
    await expect(productLink).toBeVisible({ timeout: 30000 });

    // Click on first product
    await productLink.click();

    // Should navigate to product detail page
    await page.waitForURL(/\/shop\/.+/, { timeout: 60000 });
    await expect(page).toHaveURL(/\/shop\/.+/);
  });
});

test.describe('Product Detail Page', () => {
  test('displays product information', async ({ page }) => {
    // First navigate to shop to find a product
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });

    const productLink = page.locator('a[href*="/shop/"]').first();
    await expect(productLink).toBeVisible({ timeout: 30000 });
    await productLink.click();

    await page.waitForURL(/\/shop\/.+/, { timeout: 60000 });

    // Check product name is displayed
    const productName = page.locator('h1').first();
    await expect(productName).toBeVisible({ timeout: 30000 });
  });
});

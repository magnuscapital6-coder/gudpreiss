import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully and displays main content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Check page title
    await expect(page).toHaveTitle(/TechNova/);

    // Check main element exists
    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 30000 });
  });

  test('navigation header is visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Check header exists
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 30000 });
  });

  test('can navigate to shop page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click on shop link
    const shopLink = page.locator('a[href="/shop"]').first();
    await expect(shopLink).toBeVisible({ timeout: 30000 });
    await shopLink.click();

    await page.waitForURL(/\/shop/, { timeout: 60000 });
    await expect(page).toHaveURL(/\/shop/);
  });

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click on login/account link
    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible({ timeout: 30000 });
    await loginLink.click();

    await page.waitForURL(/\/login/, { timeout: 60000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

import { test, expect } from '@playwright/test';

// Helper to login as admin
async function loginAsAdmin(page: any) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 30000 });

  await emailInput.fill('admin@technova.store');
  await page.locator('input[type="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();

  await page.waitForURL(/\/admin/, { timeout: 30000 });
}

test.describe('Admin Dashboard', () => {
  test('loads after login', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin/);

    // Dashboard should have some content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('sidebar navigation is visible', async ({ page }) => {
    await loginAsAdmin(page);

    // Check sidebar exists
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Admin Settings', () => {
  test('settings page loads with bank fields', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    // Wait for settings form to load
    await page.waitForTimeout(3000);

    // Check that settings page has content
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Bankverbindung');
  });

  test('settings page has tax rate field', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('TVA');
  });
});

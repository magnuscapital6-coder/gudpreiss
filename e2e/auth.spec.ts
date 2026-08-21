import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('login form is displayed', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Check email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 30000 });

    // Check password input exists
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check submit button exists
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test('can login with demo admin credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Wait for form to be ready
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 30000 });

    // Fill in demo admin credentials
    await emailInput.fill('admin@technova.store');
    await page.locator('input[type="password"]').fill('password123');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Should redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  test('has demo credentials hint', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Check that demo credentials are shown
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    expect(content).toContain('admin@technova.store');
  });
});

test.describe('Admin Route Protection', () => {
  test('redirects to login when accessing admin without auth', async ({ page }) => {
    // Clear any existing auth
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('technova_auth_user');
      document.cookie = 'technova_auth_user=; path=/; max-age=0';
    });

    // Try to access admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('admin is accessible after login', async ({ page }) => {
    // Login first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 30000 });

    await emailInput.fill('admin@technova.store');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to admin
    await page.waitForURL(/\/admin/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/admin/);
  });
});

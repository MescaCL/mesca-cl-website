import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Public website', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Mesca/);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('Mesca');
  });

  test('about page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/about`);
    expect(response?.status()).toBe(200);
  });

  test('projects page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/projects`);
    expect(response?.status()).toBe(200);
  });

  test('contact page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/contact`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('form')).toBeVisible();
  });

  test('support page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/support`);
    expect(response?.status()).toBe(200);
  });

  test('privacy page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/privacy`);
    expect(response?.status()).toBe(200);
  });

  test('terms page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/terms`);
    expect(response?.status()).toBe(200);
  });

  test('blog page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/blog`);
    expect(response?.status()).toBe(200);
  });

  test('journey page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/journey`);
    expect(response?.status()).toBe(200);
  });

  test('search page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/search`);
    expect(response?.status()).toBe(200);
  });
});

test.describe('Admin authentication', () => {
  const adminPaths = [
    '/admin/login',
    '/admin',
    '/admin/settings',
    '/admin/projects',
    '/admin/posts',
    '/admin/media',
    '/admin/messages',
    '/admin/comments',
    '/admin/analytics',
    '/admin/account',
    '/admin/categories',
    '/admin/milestones',
    '/admin/now',
    '/admin/social-links',
    '/admin/newsletter',
  ];

  adminPaths.forEach((path) => {
    test(`${path} loads or redirects appropriately`, async ({ page }) => {
      const response = await page.goto(`${BASE}${path}`);
      if (path === '/admin/login') {
        expect(response?.status()).toBe(200);
        await expect(page.locator('h1')).toContainText('Admin sign in');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"')).toBeVisible();
      } else {
        expect(page.url()).toContain('/admin/login');
      }
    });
  });
});
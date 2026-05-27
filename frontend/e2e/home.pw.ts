import { test, expect } from '@playwright/test';

test('homepage should load', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.*Gamify.*/); // Adjust based on your app title
});

test('navigation should work', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('app-header');
  await expect(header).toBeVisible();
});
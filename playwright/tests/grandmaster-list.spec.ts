import { test, expect } from '@playwright/test';

test('homepage loads and shows heading and a row', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /chess grandmasters/i })
  ).toBeVisible();
  await expect(page.locator('a[href^="/player/"]')).toHaveCount(1, {
    timeout: 10000,
  });
});

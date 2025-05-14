import { test, expect } from '@playwright/test';

test.describe('Grandmaster List', () => {
  test('homepage loads and shows heading and a row', async ({ page }) => {
    await page.goto('/');

    // Check for heading
    await expect(
      page.getByRole('heading', { name: /chess grandmasters/i })
    ).toBeVisible();

    // Wait for and check the first grandmaster row
    const firstRow = page.locator('a[href^="/player/"]').first();
    await expect(firstRow).toBeVisible();

    // Verify row content
    const title = firstRow.locator('.rounded-full').first();
    await expect(title).toHaveText(/GM|IM/);

    // Check that we have multiple rows
    await expect(page.locator('a[href^="/player/"]')).toHaveCount(10);
  });

  test('clicking a grandmaster row shows their profile', async ({ page }) => {
    await page.goto('/');

    // Wait for the first row and get its data
    const firstRow = page.locator('a[href^="/player/"]').first();
    await firstRow.waitFor({ state: 'visible' });

    // Store the name and username before clicking
    const name = await firstRow.locator('.font-extrabold').textContent();
    const username = await firstRow.locator('.text-blue-300').textContent();

    // Ensure we have the required data
    expect(name).not.toBeNull();
    expect(username).not.toBeNull();
    const usernameClean = username!.replace('@', '');

    // Click the row
    await firstRow.click();

    // Verify we're on the profile page and it shows the correct data
    await expect(page).toHaveURL(new RegExp(`/player/${usernameClean}`));
    await expect(
      page.getByRole('heading', { level: 1, name: name! })
    ).toBeVisible();
    await expect(page.getByText(username!)).toBeVisible();

    // Verify back button exists and works
    const backButton = page.getByRole('button', {
      name: /back to grandmaster list/i,
    });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Verify we're back on the list with the fromProfile parameter
    await expect(page).toHaveURL('/?fromProfile=1');
    await expect(
      page.getByRole('heading', { name: /chess grandmasters/i })
    ).toBeVisible();
  });
});

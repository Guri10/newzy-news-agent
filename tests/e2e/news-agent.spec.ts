import { expect, test } from '@playwright/test';

test('dashboard loads', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Newzy News Agent' })).toBeVisible();
  await expect(page.getByLabel('Geopolitics')).toBeVisible();
  await expect(page.getByLabel('Sports')).toBeVisible();
});

test('toggles categories and saves schedule time', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Sports').uncheck();
  await page.getByLabel('Daily schedule').check();
  await page.getByLabel('Schedule time').fill('17:30');
  await page.getByRole('button', { name: 'Save settings' }).click();

  await expect(page.getByRole('status')).toHaveText('Settings saved');
  await expect(page.getByLabel('Sports')).not.toBeChecked();
  await expect(page.getByLabel('Daily schedule')).toBeChecked();
  await expect(page.getByLabel('Schedule time')).toHaveValue('17:30');
});

test('manual fetch button reports a refreshed digest when API is mocked', async ({
  page,
}) => {
  await page.route('**/api/fetch-now', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        articlesFetched: 1,
        digest: {
          id: 'digest-1',
          date: '2026-06-22',
          sections: [],
          createdAt: '2026-06-22T17:30:00.000Z',
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Fetch now' }).click();

  await expect(page.getByRole('status')).toHaveText('Digest refreshed');
});

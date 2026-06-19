import { test, expect } from '@playwright/test';
import { expectedValues } from '../support/testData';

const baseUrl = process.env.BASE_URL || 'https://iris.revelarautomation.com';

test.describe('Public site', () => {
  test('Homepage should display the legacy-corrected QE Index', async ({ page }) => {
    test.fail(true, 'Known defect: Homepage displays 87.4% instead of legacy-corrected 84.7%.');

    await page.goto('/');

    await expect(page.getByText('Quarterly Enrichment Index')).toBeVisible();

    await expect(
      page.getByText(`${expectedValues.correctedLegacyQeIndex}%`, { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText(expectedValues.publicQeIndexText, { exact: true }),
    ).not.toBeVisible();
  });

  test('All programs link should open a valid public programs page', async ({ page }) => {
    test.fail(true, 'Known defect: All programs link opens a 404 error page.');

    await page.goto('/');

    await page.getByRole('link', { name: 'All programs →' }).click();

    await expect(page).toHaveURL(`${baseUrl}/programs`);
    await expect(page.getByRole('heading', { name: '404 Not Found' })).not.toBeVisible();
  });

  test('All subjects link should open a valid public subject spotlight page', async ({ page }) => {
    test.fail(true, 'Known defect: All subjects link opens a 404 error page.');

    await page.goto('/');

    await page.getByRole('link', { name: 'All subjects →' }).click();

    await expect(page).toHaveURL(`${baseUrl}/spotlight`);
    await expect(page.getByRole('heading', { name: '404 Not Found' })).not.toBeVisible();
  });
});
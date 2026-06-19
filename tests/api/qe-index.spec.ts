import { test, expect } from '@playwright/test';
import { createApiContext, loginAs } from '../support/apiClient';
import { credentials, expectedValues } from '../support/testData';

type DashboardResponse = {
  qe_index: number;
};

test.describe('Quarterly Enrichment Index', () => {
  test('Dashboard QE Index should match the legacy-corrected value', async () => {
    test.fail(true, 'Known defect: Dashboard QE Index is 31.0 instead of legacy-corrected 84.7.');

    const api = await createApiContext();
    await loginAs(api, credentials.director);

    const response = await api.get('/api/admin/dashboard');

    expect(response.status()).toBe(200);

    const dashboard = (await response.json()) as DashboardResponse;

    expect(
      dashboard.qe_index,
      `Expected dashboard QE Index to be ${expectedValues.correctedLegacyQeIndex}, but received ${dashboard.qe_index}.`,
    ).toBe(expectedValues.correctedLegacyQeIndex);

    await api.dispose();
  });
});
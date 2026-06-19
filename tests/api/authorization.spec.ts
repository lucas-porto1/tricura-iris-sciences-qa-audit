import { test, expect } from '@playwright/test';
import { createApiContext, loginAs } from '../support/apiClient';
import { credentials, knownIds } from '../support/testData';

test.describe('Authorization boundaries', () => {
  test('Test Subject should not access chambers list', async () => {
    test.fail(true, 'Known defect: Test Subject can access chambers list.');

    const api = await createApiContext();
    await loginAs(api, credentials.testSubject);

    const response = await api.get('/api/admin/chambers');

    expect(response.status()).toBe(403);

    await api.dispose();
  });

  test('Test Subject should not access legacy chamber details', async () => {
    test.fail(true, 'Known defect: Test Subject can access legacy chamber details.');

    const api = await createApiContext();
    await loginAs(api, credentials.testSubject);

    const response = await api.get(
      `/api/admin/chambers/${encodeURIComponent(knownIds.legacyChamberId)}`,
    );

    expect(response.status()).toBe(403);

    await api.dispose();
  });

  test('Test Subject should not access admin dashboard operational metrics', async () => {
    test.fail(true, 'Known defect: Test Subject can access admin dashboard operational metrics.');

    const api = await createApiContext();
    await loginAs(api, credentials.testSubject);

    const response = await api.get('/api/admin/dashboard');

    expect(response.status()).toBe(403);

    await api.dispose();
  });

  test('Test Subject should not access report export controls', async () => {
    test.fail(true, 'Known defect: Test Subject can access report export controls.');

    const api = await createApiContext();
    await loginAs(api, credentials.testSubject);

    const response = await api.get('/api/admin/reports/export');

    expect(response.status()).toBe(403);

    await api.dispose();
  });
});
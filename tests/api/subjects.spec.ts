import { test, expect } from '@playwright/test';
import { createApiContext, loginAs } from '../support/apiClient';
import { credentials } from '../support/testData';

test.describe('Subject records availability', () => {
  test('Junior Coordinator should be able to retrieve the subject list', async () => {
    test.fail(true, 'Known defect: Subject list endpoint returns 500 Internal Server Error.');

    const api = await createApiContext();
    await loginAs(api, credentials.junior);

    const response = await api.get('/api/admin/subjects');

    expect(response.status()).toBe(200);

    const subjects = await response.json();

    expect(Array.isArray(subjects)).toBe(true);

    await api.dispose();
  });
});
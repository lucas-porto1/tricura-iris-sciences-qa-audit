import { test, expect } from '@playwright/test';
import { createApiContext, loginAs, postConsoleCommand } from '../support/apiClient';
import { credentials } from '../support/testData';

test.describe('Legacy console access control', () => {
  test('Test Subject should not access the legacy console endpoint', async () => {
    test.fail(true, 'Known defect: Test Subject can access the legacy console through the API.');

    const api = await createApiContext();
    await loginAs(api, credentials.testSubject);

    const response = await postConsoleCommand(api, 'help');

    expect(response.status()).toBe(403);

    await api.dispose();
  });
});
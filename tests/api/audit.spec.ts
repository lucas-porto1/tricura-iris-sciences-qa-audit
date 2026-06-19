import { test, expect } from '@playwright/test';
import { createApiContext, loginAs } from '../support/apiClient';
import { credentials, knownIds } from '../support/testData';

type AuditEntry = {
  attachment_path: string | null;
};

test.describe('Audit sensitive data exposure', () => {
  test('Audit response should not expose credential-bearing attachment paths to Test Subject', async () => {
    test.fail(true, 'Known defect: Audit response exposes Director onboarding attachment path.');

    const api = await createApiContext();
    await loginAs(api, credentials.testSubject);

    const response = await api.get('/api/admin/audit');

    expect(response.status()).toBe(200);

    const entries = (await response.json()) as AuditEntry[];

    expect(entries).not.toContainEqual(
      expect.objectContaining({
        attachment_path: knownIds.directorOnboardingPath,
      }),
    );

    await api.dispose();
  });

  test('Test Subject should not download Director onboarding PDF', async () => {
    test.fail(true, 'Known defect: Director onboarding PDF is accessible to lower-privileged users.');

    const api = await createApiContext();
    await loginAs(api, credentials.testSubject);

    const response = await api.get(knownIds.directorOnboardingPath);

    expect(response.status()).toBe(403);

    await api.dispose();
  });
});
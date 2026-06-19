import { test, expect, APIRequestContext } from '@playwright/test';
import { createApiContext, loginAs, uniqueId } from '../support/apiClient';
import { credentials } from '../support/testData';

type SessionState =
  | 'pending-approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

type TestSession = {
  id: string;
  subject_id: string;
  chamber_id: string;
  state: SessionState;
  completed_at: string | null;
};

type SessionSeed = {
  subject_id: string;
  chamber_id: string;
};

async function getSeedSessionData(api: APIRequestContext): Promise<SessionSeed> {
  const response = await api.get('/api/admin/sessions?limit=1');

  expect(response.status()).toBe(200);

  const sessions = (await response.json()) as TestSession[];

  expect(Array.isArray(sessions)).toBe(true);
  expect(sessions.length).toBeGreaterThan(0);
  expect(sessions[0].subject_id).toBeTruthy();
  expect(sessions[0].chamber_id).toBeTruthy();

  return {
    subject_id: sessions[0].subject_id,
    chamber_id: sessions[0].chamber_id,
  };
}

async function createPendingSession(api: APIRequestContext, prefix: string): Promise<string> {
  const seed = await getSeedSessionData(api);
  const sessionId = uniqueId(prefix);

  const createResponse = await api.post('/api/admin/sessions', {
    data: {
      id: sessionId,
      subject_id: seed.subject_id,
      chamber_id: seed.chamber_id,
      scheduled_for: '2027-08-08T06:00:00Z',
    },
  });

  expect(createResponse.status()).toBe(201);

  const createdSession = (await createResponse.json()) as TestSession;

  expect(createdSession.id).toBe(sessionId);
  expect(createdSession.state).toBe('pending-approval');
  expect(createdSession.completed_at).toBeNull();

  return sessionId;
}

async function getSession(api: APIRequestContext, sessionId: string): Promise<TestSession> {
  const response = await api.get(`/api/admin/sessions/${encodeURIComponent(sessionId)}`);

  expect(response.status()).toBe(200);

  return (await response.json()) as TestSession;
}

async function expectCompleteToBeBlocked(
  api: APIRequestContext,
  sessionId: string,
  expectedState: SessionState,
): Promise<void> {
  const completeResponse = await api.post(
    `/api/admin/sessions/${encodeURIComponent(sessionId)}/complete`,
  );

  expect(
    completeResponse.ok(),
    `Session ${sessionId} should not be completed from state ${expectedState}.`,
  ).toBe(false);

  const sessionAfterCompleteAttempt = await getSession(api, sessionId);

  expect(sessionAfterCompleteAttempt.state).toBe(expectedState);
  expect(sessionAfterCompleteAttempt.completed_at).toBeNull();
}

test.describe('Session lifecycle enforcement', () => {
  test('API should not complete a pending-approval session', async () => {
    test.fail(
      true,
      'Known defect: A pending-approval session can be completed without lifecycle progression.',
    );

    const api = await createApiContext();
    await loginAs(api, credentials.director);

    const sessionId = await createPendingSession(api, 'auto-pending-complete');

    await expectCompleteToBeBlocked(api, sessionId, 'pending-approval');

    await api.dispose();
  });

  test('API should not complete an approved session before it is started', async () => {
    test.fail(
      true,
      'Known defect: An approved session can be completed without being started.',
    );

    const api = await createApiContext();
    await loginAs(api, credentials.director);

    const sessionId = await createPendingSession(api, 'auto-approved-complete');

    const approveResponse = await api.post(
      `/api/admin/sessions/${encodeURIComponent(sessionId)}/approve`,
    );

    expect(approveResponse.status()).toBe(200);

    const approvedSession = (await approveResponse.json()) as TestSession;

    expect(approvedSession.state).toBe('approved');
    expect(approvedSession.completed_at).toBeNull();

    await expectCompleteToBeBlocked(api, sessionId, 'approved');

    await api.dispose();
  });

  test('API should not complete a rejected session', async () => {
    test.fail(true, 'Known defect: A rejected session can be completed.');

    const api = await createApiContext();
    await loginAs(api, credentials.director);

    const sessionId = await createPendingSession(api, 'auto-rejected-complete');

    const rejectResponse = await api.post(
      `/api/admin/sessions/${encodeURIComponent(sessionId)}/reject`,
    );

    expect(rejectResponse.status()).toBe(200);

    const rejectedSession = (await rejectResponse.json()) as TestSession;

    expect(rejectedSession.state).toBe('rejected');
    expect(rejectedSession.completed_at).toBeNull();

    await expectCompleteToBeBlocked(api, sessionId, 'rejected');

    await api.dispose();
  });

  test('API should not complete a cancelled session', async () => {
    test.fail(true, 'Known defect: A cancelled session can be completed.');

    const api = await createApiContext();
    await loginAs(api, credentials.director);

    const sessionId = await createPendingSession(api, 'auto-cancelled-complete');

    const cancelResponse = await api.post(
      `/api/admin/sessions/${encodeURIComponent(sessionId)}/cancel`,
    );

    expect(cancelResponse.status()).toBe(200);

    const cancelledSession = (await cancelResponse.json()) as TestSession;

    expect(cancelledSession.state).toBe('cancelled');
    expect(cancelledSession.completed_at).toBeNull();

    await expectCompleteToBeBlocked(api, sessionId, 'cancelled');

    await api.dispose();
  });
});
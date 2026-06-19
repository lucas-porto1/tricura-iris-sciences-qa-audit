import { APIRequestContext, expect, request } from '@playwright/test';

type LoginInput = {
  roleId: string;
  password: string;
};

export async function createApiContext(): Promise<APIRequestContext> {
  const baseURL = process.env.BASE_URL;
  const caseToken = process.env.CASE_TOKEN;

  if (!baseURL) {
    throw new Error('BASE_URL is missing. Add it to your .env file.');
  }

  if (!caseToken) {
    throw new Error('CASE_TOKEN is missing. Add it to your .env file.');
  }

  return request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'X-Case-Token': caseToken,
    },
  });
}

export async function loginAs(api: APIRequestContext, input: LoginInput) {
  const response = await api.post('/api/auth/login', {
    form: {
      role_id: input.roleId,
      password: input.password,
    },
  });

  expect(response.status(), `Login failed for role ${input.roleId}`).toBe(200);

  return response;
}

export async function postConsoleCommand(
  api: APIRequestContext,
  command: string,
  args: string[] = [],
) {
  return api.post('/api/console', {
    data: {
      command,
      args,
    },
  });
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
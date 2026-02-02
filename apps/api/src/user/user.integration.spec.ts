import { INestApplication } from '@nestjs/common';
import { ApiClient, createIntegrationApp } from '../test/setup-integration';

describe('User Integration', () => {
  let app: INestApplication;
  let client: ApiClient;

  beforeAll(async () => {
    // Bootstrap the shared integration app and typed client
    ({ app, client } = await createIntegrationApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users then GET /users/:id', async () => {
    const createBody = {
      email: `integration-test-${Date.now()}@example.com`,
      firstName: 'Integration',
      lastName: 'Test',
      displayName: 'IntegrationTest',
    };

    // Create user
    const { data: created, error: createError } = await client.POST(
      '/users',
      { body: createBody },
    );
    expect(createError).toBeUndefined();

    expect(created!.id).toBeDefined();
    expect(created!.fullName).toBeDefined();
    expect(created!.email).toBe(createBody.email);
    expect(created!.createdAt).toBeDefined();
    expect(created!.updatedAt).toBeDefined();

    // Fetch user by ID
    const { data: fetched, error: getError } = await client.GET(
      '/users/{id}',
      { params: { path: { id: created!.id } } },
    );
    expect(getError).toBeUndefined();

    expect(fetched!.id).toBe(created!.id);
    expect(fetched!.email).toBe(created!.email);
    expect(fetched!.fullName).toBe(created!.fullName);
    expect(fetched!.createdAt).toBe(created!.createdAt);
    expect(fetched!.updatedAt).toBe(created!.updatedAt);
  });
});

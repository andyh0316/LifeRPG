import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createIntegrationApp } from '../test/setup-integration';

describe('User Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Bootstrap the shared integration app
    ({ app } = await createIntegrationApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users then GET /users/:id', async () => {
    const createBody = {
      email: 'integration-test@example.com',
      firstName: 'Integration',
      lastName: 'Test',
      displayName: 'IntegrationTest',
    };

    // Create user
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send(createBody)
      .expect(201);

    const created = createRes.body;

    expect(created).toHaveProperty('id');
    expect(created).toHaveProperty('fullName');
    expect(created).toHaveProperty('email', createBody.email);
    expect(created).toHaveProperty('createdAt');
    expect(created).toHaveProperty('updatedAt');

    // Fetch user
    const getRes = await request(app.getHttpServer())
      .get(`/users/${created.id}`)
      .expect(200);

    const fetched = getRes.body;

    expect(fetched.id).toBe(created.id);
    expect(fetched.email).toBe(created.email);
    expect(fetched.fullName).toBe(created.fullName);
    expect(fetched.createdAt).toBe(created.createdAt);
    expect(fetched.updatedAt).toBe(created.updatedAt);
  });
});

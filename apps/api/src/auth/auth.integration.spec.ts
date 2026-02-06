import { INestApplication } from '@nestjs/common';
import { users, type Db } from '@life-rpg/database';
import supertest from 'supertest';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';

describe('Auth Integration', () => {
  let app: INestApplication;
  let db: Db;
  let request: TestAgent;
  beforeAll(async () => {
    ({ app, db, request } = await createIntegrationApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login - sets token cookies for an existing user', async () => {
    // setup
    await db
      .insert(users)
      .values({ email: 'login@test.com', firstName: 'Login' })
      .onConflictDoNothing({ target: users.email });
    const agent = supertest.agent(app.getHttpServer());

    // act
    const res = await agent
      .post('/auth/login')
      .send({ email: 'LOGIN@test.com' })
      .expect(201);

    // assert
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(
      true,
    );
    expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(
      true,
    );
  });

  it('POST /auth/login - returns 404 for unknown email', async () => {
    await request
      .post('/auth/login')
      .send({ email: 'nobody@test.com' })
      .expect(404);
  });

  it('GET /auth/me - returns the authenticated user', async () => {
    // act (request agent was authenticated in createIntegrationApp with test@test.com)
    const res = await request.get('/auth/me').expect(200);

    // assert
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: 'test@test.com',
      }),
    );
  });

  it('GET /auth/me - returns 401 without cookies', async () => {
    // setup
    const unauthenticatedRequest = supertest(app.getHttpServer());

    // act & assert
    await unauthenticatedRequest.get('/auth/me').expect(401);
  });

  it('POST /auth/refresh - rotates tokens', async () => {
    // setup
    await db
      .insert(users)
      .values({ email: 'refresh@test.com', firstName: 'Refresh' })
      .onConflictDoNothing({ target: users.email });
    const agent = supertest.agent(app.getHttpServer());
    await agent
      .post('/auth/login')
      .send({ email: 'refresh@test.com' })
      .expect(201);

    // act
    const res = await agent.post('/auth/refresh').expect(201);

    // assert
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(
      true,
    );
    expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(
      true,
    );
    await agent.get('/auth/me').expect(200);
  });

  it('POST /auth/logout - clears cookies and revokes refresh token', async () => {
    // setup
    await db
      .insert(users)
      .values({ email: 'logout@test.com', firstName: 'Logout' })
      .onConflictDoNothing({ target: users.email });
    const agent = supertest.agent(app.getHttpServer());
    await agent
      .post('/auth/login')
      .send({ email: 'logout@test.com' })
      .expect(201);

    // act
    const res = await agent.post('/auth/logout').expect(201);

    // assert
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(
      cookies.some(
        (c: string) =>
          c.startsWith('access_token=;') || c.includes('access_token=;'),
      ),
    ).toBe(true);
    await agent.get('/auth/me').expect(401);
  });
});

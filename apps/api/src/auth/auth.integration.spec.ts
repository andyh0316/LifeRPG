import { INestApplication } from '@nestjs/common';
import { users, type Db } from '@life-rpg/database';
import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { AuthUserDto } from './dto/auth-user.dto';
import { SessionService } from './session.service';

// Login uses Google OAuth (external redirect), so the full login flow can't be
// tested here. Sessions are created directly via SessionService instead.
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

  it('GET /auth/me - returns the authenticated user', async () => {
    // act
    const res = await request.get('/auth/me').expect(200);

    // assert
    const me: AuthUserDto = res.body;
    expect(me).toEqual(
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

  it('POST /auth/logout - clears cookie and revokes session', async () => {
    // setup
    await db
      .insert(users)
      .values({ email: 'logout@test.com', firstName: 'Logout' })
      .onConflictDoNothing({ target: users.email });
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, 'logout@test.com'));
    const sessionService = app.get(SessionService);
    const { raw } = await sessionService.createSession(user);
    const agent = supertest.agent(app.getHttpServer());
    agent.set('Cookie', `session_token=${raw}`);

    // act
    const res = await agent.post('/auth/logout').expect(201);

    // assert
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(
      cookies.some(
        (c: string) =>
          c.startsWith('session_token=;') || c.includes('session_token=;'),
      ),
    ).toBe(true);
    await agent.get('/auth/me').expect(401);
  });
});

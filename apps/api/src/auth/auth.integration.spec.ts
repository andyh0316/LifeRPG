import { INestApplication } from '@nestjs/common';
import { users, type Db } from '@life-rpg/database';
import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import { TestAgent, createIntegrationApp } from '../../test/setup-integration';
import { AuthUserDto } from './dto/auth-user.dto';
import { SessionService } from './session.service';

// Login uses Google OAuth (external redirect), so the full login flow can't be
// tested here. Sessions are created directly via SessionService instead.
describe('Auth Integration', () => {
  let app: INestApplication;
  let db: Db;
  let request: TestAgent;
  let startTransaction: () => Promise<void>;
  let rollbackTransaction: () => Promise<void>;

  beforeAll(async () => {
    ({ app, db, request, startTransaction, rollbackTransaction } =
      await createIntegrationApp());
  });

  beforeEach(async () => {
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /auth/me - returns the authenticated user', async () => {
    // #region ----- ACT -----
    const res = await request.get('/auth/me').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const me: AuthUserDto = res.body;
    expect(me).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: 'test@test.com',
      }),
    );
    // #endregion
  });

  it('GET /auth/me - returns 401 without cookies', async () => {
    // #region ----- SETUP -----
    const unauthenticatedRequest = supertest(app.getHttpServer());
    // #endregion

    // #region ----- ACT -----
    await unauthenticatedRequest.get('/auth/me').expect(401);
    // #endregion
  });

  it('POST /auth/logout - clears cookie and revokes session', async () => {
    // #region ----- SETUP -----
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
    // #endregion

    // #region ----- ACT -----
    const res = await agent.post('/auth/logout').expect(201);
    // #endregion

    // #region ----- ASSERT -----
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(
      cookies.some(
        (c: string) =>
          c.startsWith('session_token=;') || c.includes('session_token=;'),
      ),
    ).toBe(true);
    await agent.get('/auth/me').expect(401);
    // #endregion
  });
});

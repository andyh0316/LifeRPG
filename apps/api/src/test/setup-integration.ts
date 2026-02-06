import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { users, type Db } from '@life-rpg/database';
import cookieParser from 'cookie-parser';
import supertest from 'supertest';
import { eq } from 'drizzle-orm';
import { AppModule } from '../app.module';
import { SessionService } from '../auth/session.service';

export type TestAgent = supertest.Agent;

const TEST_USER = {
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
};

/** Bootstraps a NestJS app and returns the app, db, and supertest agent. */
export async function createIntegrationApp(): Promise<{
  app: INestApplication;
  db: Db;
  request: TestAgent;
  currentUserId: number;
}> {
  // Validate that the test database URL is configured
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set');
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  // Bootstrap the NestJS application with validation
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  // Seed a test user (idempotent — skips if email already exists)
  const db = app.get<Db>('DATABASE');
  await db
    .insert(users)
    .values(TEST_USER)
    .onConflictDoNothing({ target: users.email });

  // Look up the test user and create a session directly
  const [testUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, TEST_USER.email));

  const sessionService = app.get(SessionService);
  const { raw } = await sessionService.createSession(testUser);

  // Create a supertest agent with the session cookie
  const request = supertest.agent(app.getHttpServer());
  request.set('Cookie', `session_token=${raw}`);

  return { app, db, request, currentUserId: testUser.id };
}

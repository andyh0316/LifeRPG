import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { users, type Db } from '@life-rpg/database';
import cookieParser from 'cookie-parser';
import supertest from 'supertest';
import { AppModule } from '../app.module';

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
}> {
  // Validate that the test database URL is configured
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set');
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET ??= 'test-secret';

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

  // Create a supertest agent and authenticate it
  const request = supertest.agent(app.getHttpServer());
  await request
    .post('/auth/login')
    .send({ email: TEST_USER.email })
    .expect(201);

  return { app, db, request };
}

import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createDb, users, userCharacter, type Db } from '@life-rpg/database';
import { TransactionRollbackError } from 'drizzle-orm';
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
  currentUserCharacterId: number;
  startTransaction: () => Promise<void>;
  rollbackTransaction: () => Promise<void>;
}> {
  // Validate that the test database URL is configured
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set');
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  // Create a real DB connection outside NestJS DI for seeding and transactions
  const realDb = createDb(process.env.TEST_DATABASE_URL);

  // Proxy that delegates all access to a swappable target (realDb by default).
  // During tests, the target is swapped to a transaction for rollback isolation.
  let currentTarget: Db = realDb;
  const dbProxy = new Proxy({} as Db, {
    get(_, prop) {
      const value = (currentTarget as any)[prop];
      return typeof value === 'function' ? value.bind(currentTarget) : value;
    },
  });

  // Transaction control state
  let rollbackFn: (() => void) | null = null;
  let transactionPromise: Promise<void> | null = null;

  async function startTransaction() {
    await new Promise<void>((resolveReady) => {
      transactionPromise = realDb
        .transaction(async (tx) => {
          currentTarget = tx as unknown as Db;
          const rollbackPromise = new Promise<void>((r) => {
            rollbackFn = r;
          });
          resolveReady();
          await rollbackPromise;
          throw new TransactionRollbackError();
        })
        .catch((err) => {
          if (!(err instanceof TransactionRollbackError)) throw err;
        });
    });
  }

  async function rollbackTransaction() {
    if (rollbackFn) {
      rollbackFn();
      rollbackFn = null;
    }
    if (transactionPromise) {
      await transactionPromise;
      transactionPromise = null;
    }
    currentTarget = realDb;
  }

  // Bootstrap the NestJS application, overriding DATABASE in all modules
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('DATABASE')
    .useValue(dbProxy)
    .compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  // Seed a test user (idempotent — skips if email already exists)
  await realDb
    .insert(users)
    .values(TEST_USER)
    .onConflictDoNothing({ target: users.email });

  // Look up the test user and create a session directly
  const [testUser] = await realDb
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, TEST_USER.email));

  // Ensure a character exists for the test user (required by session validation)
  await realDb
    .insert(userCharacter)
    .values({ userId: testUser.id, name: 'Test Character' })
    .onConflictDoNothing();

  const [character] = await realDb
    .select({ id: userCharacter.id })
    .from(userCharacter)
    .where(eq(userCharacter.userId, testUser.id));

  const sessionService = app.get(SessionService);
  const { raw } = await sessionService.createSession(testUser);

  // Create a supertest agent with the session cookie
  const request = supertest.agent(app.getHttpServer());
  request.set('Cookie', `session_token=${raw}`);

  return {
    app,
    db: dbProxy,
    request,
    currentUserId: testUser.id,
    currentUserCharacterId: character.id,
    startTransaction,
    rollbackTransaction,
  };
}

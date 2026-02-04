import { INestApplication } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { users } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';

describe('Task Completion Integration', () => {
  let app: INestApplication;
  let db: Db;
  let request: TestAgent;
  let testUserId: number;

  beforeAll(async () => {
    ({ app, db, request } = await createIntegrationApp());

    const [user] = await db
      .insert(users)
      .values({
        email: 'completiontest@example.com',
        firstName: 'Completion',
        lastName: 'Tester',
      })
      .returning({ id: users.id });
    testUserId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });
});

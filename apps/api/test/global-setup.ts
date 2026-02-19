import 'dotenv/config';
import { createDb, users, userCharacter } from '@life-rpg/database';
import { asc, eq } from 'drizzle-orm';

const TEST_USER = {
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
};

/**
 * Runs once before all test suites. Seeds the test user and character
 * so that per-suite setup only needs to query — never insert.
 */
export default async function globalSetup() {
  const dbUrl = process.env.TEST_DATABASE_URL;
  if (!dbUrl) throw new Error('TEST_DATABASE_URL must be set');

  const db = createDb(dbUrl);

  await db
    .insert(users)
    .values(TEST_USER)
    .onConflictDoNothing({ target: users.email });

  const [testUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, TEST_USER.email));

  const [existingChar] = await db
    .select({ id: userCharacter.id })
    .from(userCharacter)
    .where(eq(userCharacter.userId, testUser.id))
    .orderBy(asc(userCharacter.id))
    .limit(1);

  if (!existingChar) {
    await db
      .insert(userCharacter)
      .values({ userId: testUser.id, name: 'Test Character' });
  }
}

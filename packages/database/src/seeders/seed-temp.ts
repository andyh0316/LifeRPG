import { users, userCharacter, tasks } from '../schema.js';
import type { Db } from './types.js';

/** Runs all temporary dev/test seeders that insert sample data (will be removed later). */
export async function runTempSeeders(db: Db) {
  await seedUsers(db);
  await seedTasks(db);
}

/** Seeds a sample user and their character row for local development and testing. */
async function seedUsers(db: Db) {
  // Insert a sample user, skipping if the email already exists
  const [user] = await db
    .insert(users)
    .values({
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      displayName: 'Alice',
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  // Create the 1:1 character row if the user was newly inserted
  if (user) {
    await db
      .insert(userCharacter)
      .values({ userId: user.id })
      .onConflictDoNothing();
  }
  console.log('Seeded 1 user.');
}

/** Seeds sample tasks for local development and testing. */
async function seedTasks(db: Db) {
  // Insert sample tasks, skipping any that already exist
  await db
    .insert(tasks)
    .values([
      { name: 'Meditate 15min', coinReward: 10, xpReward: 10 },
      { name: 'Work 30 min', coinReward: 10, xpReward: 10 },
      { name: 'Work 1 hour', coinReward: 20, xpReward: 20 },
      { name: 'Study 30 min', coinReward: 15, xpReward: 15 },
      { name: 'Study 1 hour', coinReward: 30, xpReward: 30 },
      { name: 'Chores 30 min', coinReward: 10, xpReward: 10 },
      { name: 'Chores 1 hour', coinReward: 20, xpReward: 20 },
      { name: 'Eat Vitamins', coinReward: 5, xpReward: 5 },
      { name: 'Walk 30 min', coinReward: 20, xpReward: 20 },
      { name: 'Gym 60 min', coinReward: 40, xpReward: 40 },
    ])
    .onConflictDoNothing();
  console.log('Seeded 10 tasks.');
}

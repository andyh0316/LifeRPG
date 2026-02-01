import { users, tasks } from '../schema.js';
import type { Db } from './types.js';

/** Runs all temporary dev/test seeders that insert sample data (will be removed later). */
export async function runTempSeeders(db: Db) {
  await seedUsers(db);
  await seedTasks(db);
}

/** Seeds a sample user for local development and testing. */
async function seedUsers(db: Db) {
  // Insert a sample user, skipping if the email already exists
  await db
    .insert(users)
    .values({
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      displayName: 'Alice',
    })
    .onConflictDoNothing();
  console.log('Seeded 1 user.');
}

/** Seeds sample tasks for local development and testing. */
async function seedTasks(db: Db) {
  // Insert sample tasks, skipping any that already exist
  await db
    .insert(tasks)
    .values([
      { name: 'Morning Run', description: 'Go for a 30-minute run', xpReward: 50, coinReward: 10 },
      { name: 'Read a Book', description: 'Read for at least 30 minutes', xpReward: 30, coinReward: 5 },
      { name: 'Meditate', description: '10 minutes of mindfulness meditation', xpReward: 20, coinReward: 5 },
      { name: 'Cook a Meal', description: 'Prepare a homemade meal', xpReward: 40, coinReward: 8 },
      { name: 'Clean Room', description: 'Tidy up and organize your room', xpReward: 25, coinReward: 5 },
    ])
    .onConflictDoNothing();
  console.log('Seeded 5 tasks.');
}

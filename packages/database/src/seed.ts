import 'dotenv/config';
import { createDb } from './index.js';
import { users, genders, tasks } from './schema.js';

type Db = ReturnType<typeof createDb>;

async function seed() {
  const db = createDb(process.env.DATABASE_URL!);
  console.log('Seeding database...');
  await seedGenders(db);
  await seedUsers(db);
  await seedTasks(db);
  console.log('Seeding complete.');
  process.exit(0);
}

async function seedGenders(db: Db) {
  await db
    .insert(genders)
    .values([
      { name: 'male' },
      { name: 'female' },
      { name: 'non_binary' },
      { name: 'other' },
    ])
    .onConflictDoNothing();
  console.log('Seeded 4 genders.');
}

async function seedUsers(db: Db) {
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

async function seedTasks(db: Db) {
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

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

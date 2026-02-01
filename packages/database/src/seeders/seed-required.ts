import { genders } from '../schema.js';
import type { Db } from './types.js';

/** Runs all required seeders that insert reference/lookup data the app needs to function. */
export async function runRequiredSeeders(db: Db) {
  await seedGenders(db);
}

/** Seeds the gender reference table with all supported gender options. */
async function seedGenders(db: Db) {
  // Insert gender rows, skipping any that already exist
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

// Seed entry point.
//
// Required seeders — reference/lookup data the app needs to function (e.g. genders).
//                    These are permanent and should always be run.
// Temp seeders    — temporary test/dev data that will be removed later (e.g. sample users, tasks).

import 'dotenv/config';
import { createDb } from './index.js';
import { runRequiredSeeders } from './seeders/seed-required.js';
import { runTempSeeders } from './seeders/seed-temp.js';

/** Runs all database seeders: required reference data first, then temporary dev data. */
async function seed() {
  const db = createDb(process.env.DATABASE_URL!);
  console.log('Seeding database...');

  // Seed permanent reference/lookup data
  await runRequiredSeeders(db);

  // Seed temporary dev/test data
  await runTempSeeders(db);

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

// Seed entry point: this file contains the initial data right after first migrations are applied. After that, any new data should be directly in the migration sql files

// Required seeders — reference/lookup data the app needs to function.
//                    These are permanent and should always be run.
// Temp seeders    — temporary test/dev data that will be removed later (e.g. sample users, tasks).

import 'dotenv/config';
import { createDb } from './index.js';
import { runRequiredSeeders } from './seeders/seed-required.js';
import { runTempSeeders } from './seeders/seed-temp.js';

/** Runs all database seeders (required + temp) against the given DB. */
async function seed() {
  // Parse CLI args: first positional arg is the required DB URL
  const connectionUrl = process.argv[2];
  if (!connectionUrl) {
    console.error('Usage: tsx src/seed.ts <database-url>');
    process.exit(1);
  }

  const db = createDb(connectionUrl);
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

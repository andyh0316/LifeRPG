// Seed entry point.
//
// Required seeders — reference/lookup data the app needs to function (e.g. genders).
//                    These are permanent and should always be run.
// Temp seeders    — temporary test/dev data that will be removed later (e.g. sample users, tasks).

import 'dotenv/config';
import { createDb } from './index.js';
import { runRequiredSeeders } from './seeders/seed-required.js';
import { runTempSeeders } from './seeders/seed-temp.js';

/** Runs database seeders, optionally targeting a specific DB and skipping temp data. */
async function seed() {
  // Parse CLI args: first positional arg is the required DB URL
  const args = process.argv.slice(2);
  const positionalArgs = args.filter((a) => !a.startsWith('--'));
  const connectionUrl = positionalArgs[0];
  if (!connectionUrl) {
    console.error('Usage: tsx src/seed.ts <database-url> [--no-temp]');
    process.exit(1);
  }
  const skipTemp = args.includes('--no-temp');

  const db = createDb(connectionUrl);
  console.log('Seeding database...');

  // Seed permanent reference/lookup data
  await runRequiredSeeders(db);

  // Seed temporary dev/test data unless --no-temp is passed
  if (!skipTemp) {
    await runTempSeeders(db);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

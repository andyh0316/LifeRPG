import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import path from 'path';

/** Wipes and rebuilds the test database before any integration tests run. */
export default async function globalSetup(): Promise<void> {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) {
    throw new Error('TEST_DATABASE_URL must be set');
  }

  // Connect to the test database
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  // Drop all tables and migration history by resetting both schemas
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
  await db.execute(sql`DROP SCHEMA public CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);

  // Apply all Drizzle migrations to rebuild the schema
  const migrationsFolder = path.resolve(
    __dirname,
    '../../../../packages/database/drizzle',
  );
  await migrate(db, { migrationsFolder });

  // Close the connection
  await client.end();
}

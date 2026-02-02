import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

/** The Drizzle database instance type returned by createDb. */
export type Db = PostgresJsDatabase<typeof schema>;

/** Creates a Drizzle Postgres client bound to the given connection string. */
export function createDb(connectionString: string): Db {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export * from './schema.js';

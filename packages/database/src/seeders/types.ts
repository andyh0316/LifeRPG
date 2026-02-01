import type { createDb } from '../index.js';

/** Database instance type used by all seeder functions. */
export type Db = ReturnType<typeof createDb>;

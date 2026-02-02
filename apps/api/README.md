# @life-rpg/api

NestJS backend for LifeRpg.

## Testing

### Prerequisites

- Docker must be running
- `TEST_DATABASE_URL` must be set in `packages/database/.env` (points to the `db-test` container on port 5434)

### Running tests

```sh
pnpm test
```

### What happens when you run `pnpm test`

The test database is fully reset before every test run. Here's the implicit workflow:

1. **`pretest` triggers `test-db:reset`** — npm automatically runs the `pretest` script before `test`. This calls the root-level `test-db:reset` script.

2. **Docker container is destroyed** — The `db-test` container is stopped, removed, and its volume (`pgdata-test`) is deleted. This wipes all data and schema completely.

3. **Fresh container starts** — A new `db-test` container is created from the `postgres:17` image with an empty database.

4. **Wait for Postgres** — The script polls `pg_isready` inside the container until it accepts connections.

5. **Migrations run** — `drizzle-kit migrate` applies all migrations from `packages/database/drizzle/` against the fresh test database, rebuilding the full schema.

6. **Required data is seeded** — `test-db:seed` inserts reference/lookup data (e.g. genders) needed by the app. Temporary dev data is skipped (`--no-temp`).

7. **Jest runs** — Each test file uses `createIntegrationApp()` from `src/test/setup-integration.ts` to bootstrap a NestJS app connected to the test database. Tests insert their own data in `beforeAll` and don't need to clean up — the next run starts from scratch.

### Key files

| File | Purpose |
|---|---|
| `src/test/setup-integration.ts` | Bootstraps a NestJS app pointing at `TEST_DATABASE_URL` |
| `jest.config.ts` | Jest configuration (ts-jest, test matching) |
| `package.json` (`pretest`) | Triggers `test-db:reset` before every test run |
| Root `package.json` (`test-db:reset`) | Docker destroy + recreate + migrate + seed chain |

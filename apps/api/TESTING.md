# Testing

## Prerequisites

- Docker must be running
- `TEST_DATABASE_URL` must be set in `packages/database/.env` (points to the `db-test` container on port 5434)

## Running tests

```sh
pnpm test:api
```

## What happens when you run `pnpm test:api`

The test database is fully reset before every test run. Here's the implicit workflow:

1. **`pretest` triggers `test-db:reset`** — npm automatically runs the `pretest` script before `test`. This calls the root-level `test-db:reset` script.

2. **Docker container is destroyed** — The `db-test` container is stopped, removed, and its volume (`pgdata-test`) is deleted. This wipes all data and schema completely.

3. **Fresh container starts** — A new `db-test` container is created from the `postgres:17` image with an empty database.

4. **Wait for Postgres** — The script polls `pg_isready` inside the container until it accepts connections.

5. **Migrations run** — `drizzle-kit migrate` applies all migrations from `packages/database/drizzle/` against the fresh test database, rebuilding the full schema.

6. **Jest runs** — Each test file uses `createIntegrationApp()` from `test/setup-integration.ts` to bootstrap a NestJS app connected to the test database. Tests insert their own data in `beforeAll` and don't need to clean up — the next run starts from scratch.

## Typed API client

Integration tests use `openapi-fetch` with generated types from `@life-rpg/api-client` instead of supertest. This gives full type safety on request bodies, path params, and response data — the same types the web frontend uses.

`createIntegrationApp()` returns a typed `client` that listens on a random port:

```ts
const { app, db, client } = await createIntegrationApp();

const { data, error } = await client.GET('/tasks');
// data is typed as TaskResponseDto[]
```

## Key files

| File                                  | Purpose                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `test/setup-integration.ts`           | Bootstraps a NestJS app, listens on a random port, returns a typed API client |
| `jest.config.ts`                      | Jest configuration (ts-jest, test matching)                                   |
| `package.json` (`pretest`)            | Triggers `test-db:reset` before every test run                                |
| Root `package.json` (`test-db:reset`) | Docker destroy + recreate + migrate chain                                     |

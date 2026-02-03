# @life-rpg/database

Database schema, migrations, and client using Drizzle ORM with PostgreSQL.

## Environment variables

| Variable            | Description                                         |
| ------------------- | --------------------------------------------------- |
| `DATABASE_URL`      | Connection string for the dev database (port 5433)  |
| `TEST_DATABASE_URL` | Connection string for the test database (port 5434) |

See `.env.example` for defaults.

## Commands

All commands can be run from the monorepo root with the `pnpm --filter @life-rpg/database` prefix, or directly from this directory.

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `pnpm build`           | Compile TypeScript to `dist/`                            |
| `pnpm generate`        | Generate a new migration from schema changes             |
| `pnpm migrate`         | Apply pending migrations to the dev database             |
| `pnpm push`            | Push schema directly to dev database (no migration file) |
| `pnpm studio`          | Open Drizzle Studio (database GUI)                       |
| `pnpm test-db:migrate` | Apply pending migrations to the test database            |

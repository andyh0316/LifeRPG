## Objectives

- Learn to build with agentic coding: go wild
- Learn about proper architecture: e.g. nestJS, DI, testing, etc
- Learn about devops: github actions, AWS infra
- Build a product that helps with my productivity.

## Project Overview

pnpm monorepo with three packages:

- `apps/api` — NestJS REST API
- `apps/web` — Vite + React + TypeScript frontend
- `packages/database` — Drizzle ORM schema and database client

## Quick Start

```bash
pnpm run menu          # interactive script picker (type to filter)
```

## Docker

```bash
pnpm docker:up                # start docker container (e.g. contains db, test-db)
pnpm docker:down              # stop container
pnpm docker:nuke              # stop containers and delete volumes (storage)
```

## API (`apps/api`)

```bash
pnpm dev:api          # start in watch mode (port 3000)
pnpm build:api        # production build
```

Swagger UI is available at `http://localhost:3000/api` when the API is running.

Requires a `.env` file in `apps/api/` — see `.env.example`.

## Web (`apps/web`)

```bash
pnpm dev:web          # start dev server (port 5173)
pnpm build:web        # production build
```

## Database (`packages/database`)

Uses Drizzle ORM with PostgreSQL.

```bash
pnpm db:generate              # generate migration from schema changes
pnpm db:migrate               # run pending migrations
pnpm db:studio                # open Drizzle Studio (DB browser)
pnpm db:seed                  # insert sample data (dev only)
pnpm db:destroy-and-recreate  # nuke, restart, migrate, and seed
```

Requires a `.env` file in `packages/database/` — see `.env.example`.

After changing the schema, rebuild the package so the API picks up the changes:

```bash
cd packages/database && pnpm build
```

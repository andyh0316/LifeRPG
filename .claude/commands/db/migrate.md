Guide me through a database migration. Ask which operation I want to perform:

1. **Generate** — I've made schema changes and need to generate a new migration file.
   - Run: `pnpm --filter @life-rpg/database generate`
   - After generating, show me the generated SQL file in `packages/database/drizzle/` so I can review it.

2. **Apply** — Apply pending migrations to the database.
   - Run: `pnpm --filter @life-rpg/database migrate`

3. **Revert** — I need to undo the last migration.
   - First, display this warning in big bold text:
     **⚠️ WARNING: This only removes the migration file — it does NOT reverse already-applied SQL. Only safe for unapplied migrations.**
   - Show me the most recent migration file in `packages/database/drizzle/`.
   - Ask me to confirm before reverting.
   - Run: `pnpm --filter @life-rpg/database drizzle-kit drop`

Ask me which operation to perform before running anything.

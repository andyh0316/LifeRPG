# Plan: Rewrite goals progress integration test with time-boundary verification

## Summary

Replace the current delta-based progress test with a test that inserts `taskCompletions` rows directly (via `db`) at specific `date_trunc` boundaries, then verifies each time period includes exactly the right entries.

## Approach

No mocking of `NOW()` needed. Instead:

1. Query PostgreSQL for the 5 actual `date_trunc` boundaries (day, week, month, quarter, year)
2. Create a task via API (needed for the foreign key)
3. Insert 6 `taskCompletions` rows directly via `db.insert()`, each with a distinct `xpEarned` and a `completedAt` at each boundary:
   - `date_trunc('day', now())` → 10 XP
   - `date_trunc('week', now())` → 20 XP
   - `date_trunc('month', now())` → 30 XP
   - `date_trunc('quarter', now())` → 40 XP
   - `date_trunc('year', now())` → 50 XP
   - 1 second before year start → 60 XP (should be excluded from all periods)
4. Compute expected sums programmatically: for each period, sum XP of all entries where `completedAt >= that period's boundary`
5. Assert exact values

This is deterministic regardless of what day/month the test runs — if today happens to be Monday Jan 1st, some boundaries collapse to the same timestamp, and the expected sums adjust automatically.

## File to modify

### `apps/api/src/user-character/user-character.integration.spec.ts`

- Add `db` to the `beforeAll` destructuring (already returned by `createIntegrationApp`)
- Import `taskCompletions`, `tasks`, `sql` from `@life-rpg/database` / `drizzle-orm`
- Replace the existing progress test with the new boundary-based test
- Clean up imports (`CreateTaskDto`, `TaskResponseDto` still needed for task creation)

## Verification

- `pnpm --filter @life-rpg/api test -- --testPathPatterns user-character`

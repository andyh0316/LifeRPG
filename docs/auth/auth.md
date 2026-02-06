# Auth

**Projects:** `apps/api`, `apps/web`

**Decision:** Use a 1 stateful token system stored in the database. Later, consider moving to a cache (e.g. Redis) for faster lookups.

![Token system trade-offs](token-system-tradeoffs.png)

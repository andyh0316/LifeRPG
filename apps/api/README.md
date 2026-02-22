# API

NestJS REST API with Drizzle ORM, PostgreSQL, and Google OAuth session-based auth.

Swagger docs available at `http://localhost:3000/swagger` during development.

## Modules

### Auth (`/auth`)

Google OAuth login with session-based authentication. Sessions are stored in the database with SHA-256 hashed tokens and configurable expiry (default 30 days). A global `SessionGuard` validates every request, loading the user and their selected character onto the request context. Set `BYPASS_AUTH=true` in dev to skip OAuth.

### User (`/user`)

User account CRUD. Creating a user automatically creates a default character in the same transaction. Deleting a user cascades to their character.

### Task (`/task`)

Task definitions with reward blocks. Each task has one or more blocks that define XP and coin rewards. Tasks support goal tracking (daily/weekly/monthly targets) and streak calculation across periods. Respects client timezone via the `x-timezone` header.

### Task Completion (`/task-completion`)

Records task completions and awards XP/coins to the character atomically. Supports undo within a 24-hour window.

### User Character (`/user-character`)

Character progression system. Manages XP, leveling (via a hardcoded XP table), coins, and XP goals per period (daily/weekly/monthly/quarterly/yearly). Goal progress sums actual completions vs targets, respecting client timezone.

### Item (`/item`)

Item definitions (name, description, icon, amount/unit). Items are scoped to a user's character.

### Shop Listing (`/shop-listing`)

Virtual shop where players spend coins to buy items. Purchases are atomic transactions that verify coin balance, create an inventory item, and deduct coins.

### Inventory Item (`/inventory-item`)

Tracks items owned by the player, including acquisition source (shop, reward, etc.) and usage status.

## Shared

### Common (`/common`)

- **`@ClientTimezone()`** — extracts timezone from the `x-timezone` request header, validates it, defaults to UTC.
- **`@CurrentUser()`** — injects the authenticated user (id, email, userCharacterId) from the request.
- **`@Public()`** — marks a route as unauthenticated (bypasses `SessionGuard`).

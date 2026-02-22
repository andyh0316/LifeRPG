Refer to README.md for project structure, setup, and available commands.

## Database

Never generate database migrations (e.g. `drizzle-kit generate`) unless explicitly asked by the user.

Never apply database migrations (e.g. `drizzle-kit migrate`) unless explicitly asked by the user. Only generate migrations automatically; applying them requires user confirmation.

## Planning

- When asked to do any design-related task in plan mode, rephrase the user's prompt clearly in your own words before writing code. This ensures alignment and catches misunderstandings early.

## Environment Variables

- When adding a new variable to `apps/api/.env`, always add it to `apps/api/.env.example` as well.

## Code Style

## Automated Test

- When writing integration tests, structure each test case into stages by SETUP ACT ASSERT when applicable. Each stage will have comment "#region ----- STAGE -----" with "endregion" at the end.
- Do not add redundant comments before `it` blocks if the `it` description string is sufficient.

## MCP Playwright (Browser Access)

- **Before starting**: Kill any existing processes on the API and web ports (e.g. `lsof -ti:<PORT> | xargs kill -9`) to avoid EADDRINUSE errors.
- **Dev server**: `pnpm dev` from repo root starts both API and web.
- **API port**: Read `PORT` from `apps/api/.env` (defaults to 3000). Poll `curl -s http://localhost:<PORT>` every 2s until it responds before navigating the browser.
- **Web port**: Read `server.port` from `apps/web/vite.config.ts` (defaults to 5173). Vite auto-increments if the port is taken, so check the `pnpm dev` output for the actual port (look for "Local: http://localhost:XXXX").
- **Google login account**: Use **andyhong316@gmail.com** (not nospamplease2222).
- **Login flow**: Click "Sign in with Google" → pick the correct account → OAuth redirects back to the app.
- **Cleanup**: When done testing, kill the dev server processes and free the API/web ports (e.g. `lsof -ti:<PORT> | xargs kill -9`).

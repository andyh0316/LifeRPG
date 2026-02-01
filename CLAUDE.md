Refer to README.md for project structure, setup, and available commands.

## Database

Never apply database migrations (e.g. `drizzle-kit migrate`) unless explicitly asked by the user. Only generate migrations automatically; applying them requires user confirmation.

## Code Style

- Every new function must have a short description comment above it (1-3 sentences).
- Inside function bodies, add a one-line comment for each logical section of code.

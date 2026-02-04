Refer to README.md for project structure, setup, and available commands.

## Database

Never generate database migrations (e.g. `drizzle-kit generate`) unless explicitly asked by the user.

Never apply database migrations (e.g. `drizzle-kit migrate`) unless explicitly asked by the user. Only generate migrations automatically; applying them requires user confirmation.

## Code Style

## Automated Test

- When applicable, use `// setup`, `// act`, `// assert` comments inside the test body to separate sections.
- Do not add redundant comments before `it` blocks if the `it` description string is sufficient.

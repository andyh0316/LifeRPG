# Add Google OAuth Login

Add "Sign in with Google" using the standard OAuth2 redirect flow, reusing the existing session-based auth. The user must already exist in the database — if no account matches the Google email, the login is rejected.

## Flow

1. User clicks "Sign in with Google" → browser navigates to `/api/auth/google`
2. Passport redirects to Google consent screen
3. Google redirects to `/api/auth/google/callback`
4. Backend looks up user by email — rejects if not found, creates session if found
5. Backend redirects to `FRONTEND_URL` (e.g. `http://localhost:5173`)
6. App.tsx `GET /auth/me` succeeds → user is logged in

## No migration needed

The `users` table already has `firstName`/`lastName`. No schema changes required.

## Backend

### 1. Install `passport-google-oauth20` (+ `@types/`) in `apps/api`

Passport is a Node.js authentication library that handles the OAuth2 handshake with Google for us — exchanging authorization codes for tokens, fetching the user's profile, etc. The `passport-google-oauth20` package is the Google-specific plugin. `@nestjs/passport` and `passport` are already installed; we just need the Google plugin.

### 2. Create Google Strategy

**New file:** `apps/api/src/auth/google.strategy.ts`

A Passport "strategy" is a class that defines how to authenticate a user via a specific provider. This one tells Passport: "use Google OAuth2, request the user's email and profile, and here's how to turn the Google profile into a local user." When Passport gets the Google profile back, the strategy's `validate()` method calls the existing `SessionService.findUserByEmail` to look up the user. If no account matches, it rejects with an error — no auto-creation.

### 3. Add OAuth routes to `AuthController`

**File:** `apps/api/src/auth/auth.controller.ts`

Two new endpoints that form the OAuth redirect loop:

- `GET /auth/google` — The entry point. When the browser hits this, Passport intercepts and redirects to Google's consent screen. The handler body never actually runs.
- `GET /auth/google/callback` — Google redirects back here after the user consents. Passport runs the strategy's `validate()` to get our local user, then we create a session (same as email login), set the cookie, and redirect the browser back to the frontend. If the strategy rejected (no matching user), redirect to the login page with an error indicator.

### 4. Register in `AuthModule`

**File:** `apps/api/src/auth/auth.module.ts`

Wire everything up so NestJS knows about the new strategy. Import `PassportModule` (needed for Passport strategies to work in NestJS) and register `GoogleStrategy` as a provider so it gets instantiated with its dependencies.

### 5. Update `.env.example`

**File:** `apps/api/.env.example`

Document the required environment variables. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` come from the Google Cloud Console. `GOOGLE_CALLBACK_URL` tells Google where to redirect after consent. `FRONTEND_URL` is where our backend redirects the browser after creating the session.

## Frontend

### 6. Add Google button to Login page

**File:** `apps/web/src/pages/login/Login.tsx`

Add a "Sign in with Google" button below the existing email form, separated by a divider. This is a plain link (`href="/api/auth/google"`) that triggers a full-page navigation — not an API call. The browser leaves the React app, goes through the Google consent flow, and comes back to the frontend with a session cookie already set. The existing auth gate in `App.tsx` picks it up automatically, so no other frontend changes are needed.

## Verification

- Start API + web dev servers
- Click "Sign in with Google" on login page → should redirect to Google
- After consent with a known email → redirected back to app, logged in
- After consent with an unknown email → redirected to login page (rejected)
- `GET /auth/me` returns the Google user's email
- Existing email login still works alongside Google

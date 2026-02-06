## First-Time Setup

Railway needs three services: a **PostgreSQL database**, the **NestJS API**, and the **Vite frontend**. Build and start commands are versioned in `railway.toml` files, so the only manual dashboard work is connecting the repo, setting environment variables, and generating public URLs.

Go to [railway.app](https://railway.app) and sign in with your GitHub account.

### 1. Create project + database

1. **New Project** → **Provision PostgreSQL**
2. Click the Postgres service → **Networking** → enable **TCP Proxy** to get a public connection URL
3. Go to **Variables** tab → copy the public `DATABASE_URL` (the one with `*.proxy.rlwy.net`)

### 2. Add the GitHub repo

Railway auto-detects the pnpm monorepo and creates a service for each workspace package (`api` and `web`). Build/deploy config is handled by the `railway.toml` in each app directory, so you only need to set environment variables and generate public URLs.

1. **"+ New"** → **"GitHub Repo"** → select the LifeRpg monorepo
2. Railway creates two services automatically — configure each:

**Both services** — in **Settings**:

- Click **"Add Root Directory"** → set to `apps/api` or `apps/web` respectively (so Railway finds the `railway.toml`)
- Enable **Config-as-Code** (reads `railway.toml` from the repo for build/deploy settings)
- Enable **Wait for CI** (Railway waits for GitHub Actions to pass before deploying)
- Enable **Serverless** under Deploy (sleeps the service after 10 min of inactivity to save cost; first request after sleep has a cold start)

**api** (configure first) — needs a database connection:

- Add **Variables**:
  - `DATABASE_URL` → the public Postgres URL from step 1 (the `*.proxy.rlwy.net` one). Must be the public URL because migrations run at build time, which has no access to Railway's private network.
  - `NODE_ENV` → `production`
- **Networking** → **Generate Domain**
- Deploy the service — once deployed, copy the generated domain URL for the next step

**web** — needs the API's public URL so Vite can inline it at build time:

- Add **Variable**:
  - `VITE_API_URL` → the API domain from the previous step (e.g. `https://life-rpg-api-production-xxxx.up.railway.app`)
- **Networking** → **Generate Domain**

### 3. Database migrations

Migrations run automatically during the API **build step** (see `buildCommand` in `apps/api/railway.toml`). No manual step needed.

To run migrations manually (e.g. for debugging):

```bash
brew install railway
railway login
railway link         # select your project and the api service
railway run pnpm db:migrate
```

## Config as Code

Build and deploy settings are versioned in:

- `apps/api/railway.toml`
- `apps/web/railway.toml`

These override dashboard settings on every deploy. See [Railway docs](https://docs.railway.com/reference/config-as-code).

## Notes

- `DATABASE_URL` uses the Postgres **public proxy** URL (`*.proxy.rlwy.net`) so it works during both build (migrations) and deploy (API runtime). The private `*.railway.internal` hostname only works at deploy time, not build time.
- Railway auto-detects pnpm via corepack. If you run into version issues, add `"packageManager": "pnpm@<version>"` to the root `package.json`.
- By default Railway deploys from `main`. Change in service settings if you want to deploy from another branch.

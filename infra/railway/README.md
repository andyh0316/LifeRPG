## First-Time Setup

Go to [railway.app](https://railway.app) and sign in with your GitHub account.

### 1. Create project + database

1. **New Project** → **Provision PostgreSQL**
2. Click the Postgres service → **Variables** tab → note the `DATABASE_URL`

### 2. Deploy the API

1. In the same project, click **"+ New"** → **"GitHub Repo"** → select the LifeRpg monorepo
2. Rename the service to `api`
3. Set **Root Directory** to `apps/api` (under Settings)
4. Build/deploy config is handled by `apps/api/railway.toml` — no manual config needed
5. Add **Variables**:
   - `DATABASE_URL` → `${{Postgres.DATABASE_URL}}` (reference variable, auto-links to the DB)
   - `NODE_ENV` → `production`
6. **Settings** → **Networking** → **Generate Domain**

### 3. Run database migrations

Install the Railway CLI and run migrations against the Railway database:

```bash
brew install railway
railway login
railway link         # select your project and the api service
railway run pnpm db:migrate
```

Re-run this step whenever you have new migrations to apply.

### 4. Deploy the frontend

1. Click **"+ New"** → **"GitHub Repo"** → select the same repo again
2. Rename the service to `web`
3. Set **Root Directory** to `apps/web`
4. Build/deploy config is handled by `apps/web/railway.toml`
5. Add **Variable**:
   - `VITE_API_URL` → the public URL of the `api` service (e.g. `https://api-production-xxxx.up.railway.app`)
6. **Generate Domain** under Networking

## Config as Code

Build and deploy settings are versioned in:

- `apps/api/railway.toml`
- `apps/web/railway.toml`

These override dashboard settings on every deploy. See [Railway docs](https://docs.railway.com/reference/config-as-code).

## Notes

- The Postgres `DATABASE_URL` reference variable uses Railway's internal network (`*.railway.internal`) — it only works between Railway services, not from your local machine.
- Railway auto-detects pnpm via corepack. If you run into version issues, add `"packageManager": "pnpm@<version>"` to the root `package.json`.
- By default Railway deploys from `main`. Change in service settings if you want to deploy from another branch.

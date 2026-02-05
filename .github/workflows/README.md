# GitHub Actions Workflows

## Workflows

### `ci.yml` — CI

Runs on every push to `main` and on pull requests targeting `main`.

1. Spins up a Postgres service container
2. Installs pnpm + Node 20
3. Installs dependencies (`pnpm install --frozen-lockfile`)
4. Builds all packages (`pnpm build`)
5. Runs database migrations against the test DB
6. Runs the test suite

### `deploy.yml` — Deploy to Lightsail

Triggers automatically after CI passes on `main` (via `workflow_run`). Does **not** run on PRs.

1. SSHs into the Lightsail VM using `appleboy/ssh-action`
2. Runs `infra/lightsail/deploy.sh` which pulls code, builds, migrates, and restarts the app

## Required Secrets for Deployment

| Secret | Value |
|--------|-------|
| `LIGHTSAIL_HOST` | Static IP of the Lightsail instance |
| `LIGHTSAIL_SSH_KEY` | Private SSH key for the VM |
| `LIGHTSAIL_USERNAME` | SSH user, typically `ubuntu` |

Add these in **Settings > Secrets and variables > Actions** in the GitHub repo.

## Flow

```
PR opened → ci.yml (build + test)
Push to main → ci.yml (build + test) → deploy.yml (SSH + deploy)
```

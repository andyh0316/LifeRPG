# Infrastructure

Deployment files for a single AWS Lightsail VM ($7/mo, Ubuntu 22.04, 1GB RAM) running the full stack.

## How It Works

There are two phases:

**One-time setup** — You create a Lightsail VM, SSH in, and run `setup-server.sh`. This installs Node, Nginx, PostgreSQL, and PM2 on the server. It also clones the repo to `/opt/life-rpg`, builds the app from source, and starts it. After this, the app is live.

**Every deploy after that** — When you push to `main`, GitHub Actions runs CI (build + test). If CI passes, it SSHs into the server and runs `deploy.sh`. That script does `git pull` to fetch your latest code, rebuilds, runs any new database migrations, and restarts the app. No full clone — just pulling new changes.

## Architecture

```
Internet :80 → Nginx
                ├── /            → /var/www/life-rpg/ (static SPA)
                └── /api/*       → proxy_pass localhost:3000

PM2 → node apps/api/dist/main.js (port 3000)
       └── PostgreSQL localhost:5432/life_rpg
```

The frontend is built with `VITE_API_URL=/` so all API calls go to the same origin. Nginx serves the SPA and reverse-proxies `/api` to the Node backend. No CORS, no separate domain.

## Files

| File                   | Purpose                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `nginx.conf`           | Nginx site config — SPA serving, `/api` reverse proxy, gzip, static asset caching           |
| `ecosystem.config.cjs` | PM2 process config — app name, script path, 512M memory limit, auto-restart                 |
| `setup-server.sh`      | One-time server provisioning — installs everything, creates DB, builds, starts the app      |
| `deploy.sh`            | Deployment script — pull, install, build, migrate, copy frontend, restart PM2, health check |

## First-Time Setup

1. Create a Lightsail instance: **Ubuntu 22.04**, **$7/mo** (1GB RAM), Dual-stack networking
2. Attach a **static IP** to the instance (Lightsail → Networking tab — free while attached)
3. Download the default SSH key (Lightsail → Account → SSH keys) and save the `.pem` file locally
4. Copy `setup-server.sh` from this computer to the server:

   ```bash
   scp -i /path/to/your-lightsail-key.pem infra/setup-server.sh ubuntu@YOUR_STATIC_IP:~/setup-server.sh
   ```

5. SSH into the server:

   ```bash
   ssh -i /path/to/your-lightsail-key.pem ubuntu@YOUR_STATIC_IP
   ```

   OR use the browser-based SSH terminal in the Lightsail console

6. Run the setup script — it will prompt you to create a db username and password (find these values in **GitHub repo → Settings → Environments → Variables**):
   ```bash
   bash setup-server.sh
   ```
7. Set up `.env` files on the server — see [Environment Configuration](#environment-configuration) below.

## Environment Configuration

The `.env` files are not created by the setup or deploy scripts — you transfer them manually. The values are stored in **GitHub repo → Settings → Environments → Variables** for reference.

Three `.env` files are needed on the server:

```bash
nano /opt/life-rpg/packages/database/.env
```

```bash
nano /opt/life-rpg/apps/api/.env
```

```bash
nano /opt/life-rpg/apps/web/.env
```

These files persist across deploys since `deploy.sh` does a `git pull` (which won't overwrite untracked `.env` files). You only need to redo this if the server is reprovisioned or the files are deleted.

## Automatic Deployment

Add GitHub secrets for automated deploys:

Go to **GitHub repo → Settings → Secrets and variables → Actions → Repository secrets** (not Environment secrets).

| Secret | Value |
|---|---|
| `LIGHTSAIL_HOST` | Your static IP (e.g. `3.16.195.30`) |
| `LIGHTSAIL_USERNAME` | `ubuntu` |
| `LIGHTSAIL_SSH_KEY` | Full contents of your `.pem` key file (run `cat ~/Desktop/LightsailDefaultKey-us-east-2.pem` and copy everything including the `BEGIN`/`END` lines) |

These must be **repository secrets**, not environment secrets — the deploy workflow references them via `secrets.*` without an `environment:` field.

Deploys happen automatically when you push to `main`:

1. `ci.yml` runs build + tests
2. If CI passes, `deploy.yml` SSHs into the Lightsail server and runs `infra/deploy.sh`

You can monitor deploy runs at **GitHub repo → Actions → Deploy**.

## Manual Deployment

SSH into the server and run:

```bash
bash /opt/life-rpg/infra/deploy.sh
```

## Useful Commands on the Server

```bash
pm2 logs life-rpg-api    # view API logs
pm2 status               # check process status
pm2 restart life-rpg-api # restart the API
sudo nginx -t            # test nginx config
sudo systemctl restart nginx
sudo -u postgres psql life_rpg  # connect to the database
```

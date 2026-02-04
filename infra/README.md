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
3. Copy `setup-server.sh` from this computer to the server:

   ```bash
   scp -i /path/to/your-lightsail-key.pem infra/setup-server.sh ubuntu@YOUR_STATIC_IP:~/setup-server.sh
   ```

4. SSH into the server:

   ```bash
   ssh -i /path/to/your-lightsail-key.pem ubuntu@YOUR_STATIC_IP
   ```

   OR use the browser-based SSH terminal in the Lightsail console

5. Run the setup script (it will prompt you for a database password):
   ```bash
   bash setup-server.sh
   ```
6. Add GitHub secrets for automated deploys (see [workflows README](../.github/workflows/README.md)):
   - `LIGHTSAIL_HOST` → your static IP
   - `LIGHTSAIL_SSH_KEY` → private key contents (download from Lightsail)
   - `LIGHTSAIL_USERNAME` → `ubuntu`

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

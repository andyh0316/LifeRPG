#!/usr/bin/env bash
# One-time server provisioning script for AWS Lightsail (Ubuntu 22.04)
#
# Provisions: Node.js 20, pnpm 9, PostgreSQL 17, Nginx, PM2
# Deploys:    NestJS API (PM2) + React SPA (Nginx static files)
#
# Prerequisites:
#   - Fresh Ubuntu 22.04 Lightsail instance with SSH access
#   - Git installed (comes pre-installed on Lightsail Ubuntu)
#
# Usage: ssh user@host 'bash -s' < infra/setup-server.sh
#        (you'll be prompted for the database password)
set -euo pipefail

read -rsp "Enter database password: " DB_PASSWORD
echo
APP_DIR="/opt/life-rpg"
WEB_DIR="/var/www/life-rpg"

echo "=== Installing system dependencies ==="

# Ubuntu's default Node.js is far too old; pull v20 LTS from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm 9 — fast, disk-efficient package manager used by this monorepo
sudo npm install -g pnpm@9

# Nginx — serves the React SPA and reverse-proxies API requests
sudo apt-get install -y nginx

# Ubuntu 22.04 ships PostgreSQL 14; add the PGDG repo to get Postgres 17
sudo apt-get install -y gnupg2
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
sudo apt-get update
sudo apt-get install -y postgresql-17

echo "=== Configuring PostgreSQL ==="

# Create a dedicated database and user for the app
sudo -u postgres psql <<SQL
CREATE USER life_rpg_user WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE life_rpg OWNER life_rpg_user;
SQL

# Tune Postgres for a 1 GB Lightsail instance — increase these values
# proportionally if you upgrade to a larger VM
sudo tee -a /etc/postgresql/17/main/conf.d/tuning.conf > /dev/null <<CONF
shared_buffers = 128MB
work_mem = 4MB
maintenance_work_mem = 64MB
effective_cache_size = 512MB
CONF
sudo systemctl restart postgresql

echo "=== Setting up application ==="

# PM2 — process manager that auto-restarts the API on crash and
# persists processes across server reboots via systemd
sudo npm install -g pm2

# Clone into /opt (standard location for third-party apps), then chown
# back to the SSH user so pnpm install and builds don't require root
sudo git clone https://github.com/andyh0316/LifeRpg.git "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"
cd "$APP_DIR"

# Create .env for the database package
cat > packages/database/.env <<ENV
DATABASE_URL=postgresql://life_rpg_user:${DB_PASSWORD}@localhost:5432/life_rpg
ENV

# Create .env for the API
cat > apps/api/.env <<ENV
DATABASE_URL=postgresql://life_rpg_user:${DB_PASSWORD}@localhost:5432/life_rpg
NODE_ENV=production
PORT=3000
ENV

# Three-step build pipeline: install deps → build all monorepo packages → apply DB schema
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate

echo "=== Configuring Nginx ==="

# Nginx uses a sites-available/sites-enabled symlink pattern:
# configs live in sites-available, and only symlinked ones in sites-enabled are active.
# Remove the default site so our config is the only one serving traffic.
sudo cp infra/nginx.conf /etc/nginx/sites-available/life-rpg
sudo ln -sf /etc/nginx/sites-available/life-rpg /etc/nginx/sites-enabled/life-rpg
sudo rm -f /etc/nginx/sites-enabled/default

# Serve the Vite production build as static files through Nginx
sudo mkdir -p "$WEB_DIR"
sudo cp -r apps/web/dist/* "$WEB_DIR/"

# Validate config before restarting to catch syntax errors early
sudo nginx -t
sudo systemctl restart nginx

echo "=== Configuring firewall ==="

# Only SSH (22) and HTTP (80) are opened; HTTPS (443) is omitted because
# TLS termination is not yet configured (add it via Certbot or a load balancer)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw --force enable

echo "=== Starting application with PM2 ==="

# 1) Start the app using the PM2 ecosystem config
# 2) Save the process list so PM2 restores it after reboot
# 3) Generate and install the systemd startup hook for the current user
pm2 start infra/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | sudo bash

echo "=== Setup complete ==="
# The API may need a few seconds to boot before responding to health checks
echo "Health check:"
curl -s http://localhost:3000/api || echo "API not responding yet — check logs with: pm2 logs life-rpg-api"

#!/usr/bin/env bash
# One-time server provisioning script for AWS Lightsail (Ubuntu 22.04)
# Run manually via SSH: bash infra/setup.sh
set -euo pipefail

APP_DIR="/opt/life-rpg"
WEB_DIR="/var/www/life-rpg"

echo "=== Installing system dependencies ==="

# Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm 9
sudo npm install -g pnpm@9

# Nginx
sudo apt-get install -y nginx

# PostgreSQL 17
sudo apt-get install -y gnupg2
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
sudo apt-get update
sudo apt-get install -y postgresql-17

echo "=== Configuring PostgreSQL ==="

# Create database and user
sudo -u postgres psql <<SQL
CREATE USER life_rpg_user WITH PASSWORD 'CHANGE_ME_BEFORE_RUNNING';
CREATE DATABASE life_rpg OWNER life_rpg_user;
SQL

# Tune Postgres for low memory (1GB VM)
sudo tee -a /etc/postgresql/17/main/conf.d/tuning.conf > /dev/null <<CONF
shared_buffers = 128MB
work_mem = 4MB
maintenance_work_mem = 64MB
effective_cache_size = 512MB
CONF
sudo systemctl restart postgresql

echo "=== Setting up application ==="

# Install PM2 globally
sudo npm install -g pm2

# Clone repo
sudo git clone https://github.com/YOUR_USERNAME/LifeRpg.git "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"
cd "$APP_DIR"

# Create .env for the database package
cat > packages/database/.env <<ENV
DATABASE_URL=postgresql://life_rpg_user:CHANGE_ME_BEFORE_RUNNING@localhost:5432/life_rpg
ENV

# Create .env for the API
cat > apps/api/.env <<ENV
DATABASE_URL=postgresql://life_rpg_user:CHANGE_ME_BEFORE_RUNNING@localhost:5432/life_rpg
NODE_ENV=production
PORT=3000
ENV

# Build and migrate
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate

echo "=== Configuring Nginx ==="

# Copy nginx config and enable the site
sudo cp infra/nginx.conf /etc/nginx/sites-available/life-rpg
sudo ln -sf /etc/nginx/sites-available/life-rpg /etc/nginx/sites-enabled/life-rpg
sudo rm -f /etc/nginx/sites-enabled/default

# Copy frontend build to web root
sudo mkdir -p "$WEB_DIR"
sudo cp -r apps/web/dist/* "$WEB_DIR/"

sudo nginx -t
sudo systemctl restart nginx

echo "=== Configuring firewall ==="

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw --force enable

echo "=== Starting application with PM2 ==="

pm2 start infra/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | sudo bash

echo "=== Setup complete ==="
echo "Health check:"
curl -s http://localhost:3000/api || echo "API not responding yet — check logs with: pm2 logs life-rpg-api"

#!/usr/bin/env bash
# Deployment script — called by GitHub Actions via SSH
set -euo pipefail

APP_DIR="/opt/life-rpg"
WEB_DIR="/var/www/life-rpg"

cd "$APP_DIR"

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== Building ==="
pnpm build

echo "=== Running database migrations ==="
pnpm db:migrate

echo "=== Updating frontend files ==="
sudo cp -r apps/web/dist/* "$WEB_DIR/"

echo "=== Restarting API ==="
pm2 restart life-rpg-api

echo "=== Health check ==="
sleep 3
if curl -sf http://localhost:3000/api > /dev/null; then
  echo "Health check passed"
else
  echo "Health check failed — check logs with: pm2 logs life-rpg-api"
  exit 1
fi

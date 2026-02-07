#!/usr/bin/env bash
# Creates a pg_dump backup of the database into packages/database/backups/.
# Keeps at most 5 backups; deletes the oldest when exceeded.
# Usage: pnpm db:backup
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$DB_DIR/backups"
MAX_BACKUPS=5

# Load .env
set -a
source "$DB_DIR/.env"
set +a

if [ "$NODE_ENV" != "development" ]; then
  echo "Skipping backup (NODE_ENV=$NODE_ENV)"
  exit 0
fi

mkdir -p "$BACKUP_DIR"

# Create backup
FILENAME="backup-$(date +%Y_%m_%d__%H_%M_%S).dump"
pg_dump -Fc "$DATABASE_URL" > "$BACKUP_DIR/$FILENAME"
echo "Backup saved: $BACKUP_DIR/$FILENAME"

# Prune old backups (keep newest MAX_BACKUPS)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup-*.dump 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
  EXCESS=$((BACKUP_COUNT - MAX_BACKUPS))
  ls -1t "$BACKUP_DIR"/backup-*.dump | tail -n "$EXCESS" | xargs rm -f
  echo "Pruned $EXCESS old backup(s). Keeping newest $MAX_BACKUPS."
fi

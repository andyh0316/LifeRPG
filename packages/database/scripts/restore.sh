#!/usr/bin/env bash
# Restores the database from a backup in packages/database/backups/.
# Defaults to the most recent backup. Pass a filename to restore a specific one.
# Usage: pnpm restore [backup-file.dump]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$DB_DIR/backups"

# Load .env
set -a
source "$DB_DIR/.env"
set +a

# Resolve which backup to restore
if [ -n "${1:-}" ]; then
  BACKUP_FILE="$BACKUP_DIR/$1"
else
  BACKUP_FILE=$(ls -1t "$BACKUP_DIR"/backup-*.dump 2>/dev/null | head -n 1)
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "No backup found to restore."
  exit 1
fi

echo "Restoring from: $BACKUP_FILE"

# Extract database name from the connection URL
DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/||' | sed 's|\?.*||')
# Build a connection URL pointing to the "postgres" maintenance database
MAINTENANCE_URL=$(echo "$DATABASE_URL" | sed "s|/$DB_NAME|/postgres|")

# Terminate existing connections and drop/recreate the database
psql "$MAINTENANCE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"
psql "$MAINTENANCE_URL" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
psql "$MAINTENANCE_URL" -c "CREATE DATABASE \"$DB_NAME\";"

pg_restore -d "$DATABASE_URL" "$BACKUP_FILE"
echo "Restore complete."

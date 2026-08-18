#!/bin/sh
# Restore a backup produced by backup.sh
# Usage: ./restore.sh path/to/svlms_backup_XXXXXXXX.sql

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh path/to/backup.sql"
  exit 1
fi

PGPASSWORD="${PGPASSWORD:-postgres}" psql \
  -h "${PGHOST:-localhost}" \
  -p "${PGPORT:-5432}" \
  -U "${PGUSER:-postgres}" \
  -d "${PGDATABASE:-svlms}" \
  -f "$1"

echo "Restore complete from $1"

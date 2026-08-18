#!/bin/sh
# Simple pg_dump backup for the svlms database.
# Usage: ./backup.sh [output-directory]
#
# Requires pg_dump on PATH and the same PGPASSWORD/connection env vars as your
# docker-compose.yml (defaults: host=localhost, db=svlms, user=postgres, password=postgres).

set -e

OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$OUT_DIR/svlms_backup_$TIMESTAMP.sql"

PGPASSWORD="${PGPASSWORD:-postgres}" pg_dump \
  -h "${PGHOST:-localhost}" \
  -p "${PGPORT:-5432}" \
  -U "${PGUSER:-postgres}" \
  -d "${PGDATABASE:-svlms}" \
  -F p -f "$FILE"

echo "Backup written to $FILE"

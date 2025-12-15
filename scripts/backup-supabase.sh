#!/bin/bash

set -euo pipefail

# Konfigurasi default (bisa dioverride lewat environment variable)
CONTAINER_NAME="${SUPABASE_DB_CONTAINER:-supabase-db}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
BACKUP_DIR="${SUPABASE_BACKUP_DIR:-/srv/backups}"
RETENTION_DAYS="${SUPABASE_BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%F_%H-%M-%S)"
BACKUP_FILE="${BACKUP_DIR}/coursespeak-${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Membuat backup database ke ${BACKUP_FILE}"

docker exec "${CONTAINER_NAME}" \
  pg_dump --clean --if-exists \
  --username "${DB_USER}" \
  --dbname "${DB_NAME}" \
  > "${BACKUP_FILE}"

if command -v gzip >/dev/null 2>&1; then
  gzip "${BACKUP_FILE}"
  BACKUP_FILE="${BACKUP_FILE}.gz"
  echo "[INFO] Backup dikompresi menjadi ${BACKUP_FILE}"
fi

if [[ -n "${RETENTION_DAYS}" ]]; then
  echo "[INFO] Menghapus backup yang lebih lama dari ${RETENTION_DAYS} hari"
  find "${BACKUP_DIR}" -type f -name 'coursespeak-*.sql*' -mtime "+${RETENTION_DAYS}" -delete || true
fi

if [[ -n "${SUPABASE_RCLONE_REMOTE:-}" ]]; then
  if command -v rclone >/dev/null 2>&1; then
    echo "[INFO] Mengunggah backup ke remote rclone ${SUPABASE_RCLONE_REMOTE}"
    rclone copy "${BACKUP_FILE}" "${SUPABASE_RCLONE_REMOTE}" --sftp-set-modtime=false
  else
    echo "[WARNING] rclone tidak ditemukan, lewati upload remote"
  fi
fi

echo "[INFO] Backup selesai"

#!/usr/bin/env bash
# Prints Railway variable lines from local .env (paste into Railway → Variables).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "No hay .env. Ejecuta primero ./scripts/setup-supabase.sh write-env ..." >&2
  exit 1
fi

keys=(
  GEMINI_API_KEY
  GEMINI_MODEL
  APP_URL
  ALLOWED_ORIGINS
  SUPABASE_URL
  SUPABASE_ANON_KEY
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  RATE_LIMIT_MAX
  RATE_LIMIT_WINDOW_MS
  MAX_UPLOAD_BYTES
)

echo "# Railway → Variables (copiar/pegar)"
for key in "${keys[@]}"; do
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    grep "^${key}=" "$ENV_FILE"
  fi
done

echo
echo "# Si APP_URL sigue en localhost, cámbiala tras el primer deploy por la URL *.up.railway.app"
echo "# Supabase → Authentication → URL Configuration: añade la URL de Railway"

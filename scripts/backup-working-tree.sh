#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="${1:-$HOME/nucleo-backups/nucleo-$STAMP.tar.gz}"

mkdir -p "$(dirname "$DEST")"

tar -czf "$DEST" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='android/.gradle' \
  --exclude='android/build' \
  --exclude='android/app/build' \
  --exclude='ios/DerivedData' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.staging' \
  -C "$ROOT" .

echo "Backup creado: $DEST"

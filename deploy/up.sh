#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing deploy/.env — copy backend.env.example to .env and edit secrets."
  exit 1
fi

if [[ ! -f .env.db ]]; then
  echo "Missing deploy/.env.db — copy backend.env.db.example to .env.db and edit passwords."
  exit 1
fi

if [[ ! -f ../frontend/dist/index.html ]]; then
  echo "Missing frontend/dist — build the frontend first:"
  echo "  cp deploy/frontend.env.production.example ../frontend/.env.production"
  echo "  cd ../frontend && pnpm install && pnpm build"
  exit 1
fi

docker compose up -d --build

echo ""
echo "Deployed. Open http://<orangepi-ip>/ (or your port-forwarded public URL)."
echo "Health: curl -s http://localhost/api/health"

#!/usr/bin/env bash
# Apply a SQL file to Postgres (e.g. Supabase). Uses psql + DATABASE_URL.
# Usage (from next-app/):
#   export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
#   npm run db:apply-sql -- supabase/migrations/20260321000000_leads_canonical_simple_crm.sql
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE="${1:-}"

if [[ -z "$FILE" ]]; then
  echo "Usage: $0 <path-to.sql>" >&2
  echo "Example: $0 supabase/migrations/20260321000000_leads_canonical_simple_crm.sql" >&2
  exit 1
fi

if [[ "$FILE" != /* ]]; then
  FILE="$ROOT/$FILE"
fi

if [[ ! -f "$FILE" ]]; then
  echo "File not found: $FILE" >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set." >&2
  echo "Supabase: Dashboard → Project Settings → Database → URI (use pooler or direct)." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Install Postgres client (e.g. brew install libpq && brew link --force libpq)." >&2
  exit 1
fi

echo "Applying: $FILE"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$FILE"
echo "Done."

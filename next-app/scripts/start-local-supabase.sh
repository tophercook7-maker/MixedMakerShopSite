#!/bin/bash
# Bring up the LOCAL Supabase stack that backs the MixedMakerShop CRM.
# Runs at login via launchd (com.mixedmakershop.supabase-local) so a reboot
# doesn't leave the live site pointing at a dead database.
#
# Idempotent: colima start / supabase start are both no-ops if already running.
# The lead-capture site has an email+push rescue path, so even if this is slow,
# no lead is ever lost — this just restores CRM-row creation + the pipeline.
set -u

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
APP_DIR="$HOME/Projects/MixedMakerShopSite/next-app"
LOG="$APP_DIR/logs/supabase-local.log"
mkdir -p "$APP_DIR/logs"

echo "===== $(date) : starting local supabase stack =====" >>"$LOG" 2>&1

# 1. Container runtime.
if ! colima status >/dev/null 2>&1; then
  echo "colima not running — starting…" >>"$LOG" 2>&1
  colima start >>"$LOG" 2>&1
else
  echo "colima already running." >>"$LOG" 2>&1
fi

# Point docker at colima (colima registers this context on start).
docker context use colima >>"$LOG" 2>&1 || true

# 2. Supabase stack (idempotent). --ignore-health-check avoids a slow-boot false-fail.
cd "$APP_DIR" || { echo "app dir missing" >>"$LOG" 2>&1; exit 1; }
if supabase status >/dev/null 2>&1; then
  echo "supabase already up." >>"$LOG" 2>&1
else
  echo "supabase not up — starting…" >>"$LOG" 2>&1
  supabase start >>"$LOG" 2>&1
fi

echo "done: $(supabase status 2>/dev/null | grep -i 'API URL' || echo 'status unavailable')" >>"$LOG" 2>&1

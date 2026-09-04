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
# A hard shutdown leaves the VM disk marked "in use by instance colima" and every
# later `colima start` dies with that, silently, forever. So: try, and if it fails,
# clear the stale lock (force-stop + reap orphaned limactl) and try once more.
if ! colima status >/dev/null 2>&1; then
  echo "colima not running — starting…" >>"$LOG" 2>&1
  if ! colima start >>"$LOG" 2>&1; then
    echo "colima start FAILED — clearing stale lock and retrying…" >>"$LOG" 2>&1
    colima stop -f >>"$LOG" 2>&1 || true
    pkill -f limactl >>"$LOG" 2>&1 || true
    sleep 3
    colima start >>"$LOG" 2>&1 || echo "colima start FAILED TWICE — CRM will be down." >>"$LOG" 2>&1
  fi
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

# 3. Prove the API actually answers. `supabase status` can look fine while the DB
# container is still unhealthy, and a half-up stack drops leads exactly like a down
# one — so poll the real endpoint and leave a loud line if it never comes up.
wait_for_api() {
  for i in $(seq 1 30); do
    code=$(curl -s -m 5 -o /dev/null -w "%{http_code}" http://127.0.0.1:54321/rest/v1/ 2>/dev/null)
    if [ "$code" != "000" ]; then
      echo "VERIFIED: REST API answering (HTTP $code) after ~$((i * 5))s" >>"$LOG" 2>&1
      return 0
    fi
    sleep 5
  done
  return 1
}

wait_for_api && exit 0

# 4. Self-heal (added 2026-09-04). Seen in the wild: every container "Up (healthy)",
# `docker port kong` shows 8000->54321, Postgres :54322 forwarded fine — but Colima's
# host-side forward for :54321 was never created after a login-time boot race, so the
# site got "connection refused" on every DB call (booking page showed no times, leads
# fell back to the email-only rescue path). Restarting the kong container did NOT fix
# it; `colima restart` rebuilds all port forwards and did. Do that once, then re-check.
echo "REST API silent on :54321 — self-heal: colima restart (rebuilds port forwards)…" >>"$LOG" 2>&1
colima restart >>"$LOG" 2>&1 || true
docker context use colima >>"$LOG" 2>&1 || true
sleep 10
supabase status >/dev/null 2>&1 || supabase start >>"$LOG" 2>&1
wait_for_api && { echo "SELF-HEAL WORKED." >>"$LOG" 2>&1; exit 0; }

echo "!!! CRM DATABASE DID NOT COME UP — inbound leads will fail to save. !!!" >>"$LOG" 2>&1
exit 1

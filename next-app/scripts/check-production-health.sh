#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/bin:/bin"

logs_dir="/Users/christophercook/Projects/MixedMakerShopSite/logs"
state_file="$logs_dir/production-health-state"
site_url="https://mixedmakershop.com/"
mkdir -p "$logs_dir"

previous_failures=0
if [[ -f "$state_file" ]]; then
  previous_failures=$(<"$state_file")
fi
[[ "$previous_failures" =~ ^[0-9]+$ ]] || previous_failures=0

status_code=$(curl --silent --show-error --location --connect-timeout 10 --max-time 30 --output /dev/null --write-out '%{http_code}' "$site_url" || true)
if [[ "$status_code" =~ ^[23][0-9][0-9]$ ]]; then
  if (( previous_failures >= 3 )); then
    osascript -e 'display notification "mixedmakershop.com is reachable again." with title "Mixed Maker Shop"'
  fi
  print -r -- 0 > "$state_file"
  exit 0
fi

failures=$((previous_failures + 1))
print -r -- "$failures" > "$state_file"
echo "$(date '+%Y-%m-%d %H:%M:%S %z') public check failed (HTTP ${status_code:-no-response}; consecutive failures: $failures)"

if (( failures == 3 )); then
  launchctl kickstart -k "gui/$(id -u)/com.mixedmakershop.local-web" || true
  launchctl kickstart -k "gui/$(id -u)/com.mixedmakershop.cloudflared" || true
  osascript -e 'display notification "mixedmakershop.com has failed three checks. I restarted its local server and Cloudflare tunnel." with title "Mixed Maker Shop"'
fi

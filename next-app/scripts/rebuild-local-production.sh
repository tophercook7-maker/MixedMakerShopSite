#!/bin/zsh
set -euo pipefail

export PATH="/Users/christophercook/.local/bin:/opt/homebrew/bin:/usr/bin:/bin"

project_root="/Users/christophercook/Projects/MixedMakerShopSite/next-app"
lock_dir="/private/tmp/mixedmakershop-local-build.lock"

if ! mkdir "$lock_dir" 2>/dev/null; then
  echo "A Mixed Maker Shop production build is already running; skipping duplicate request."
  exit 0
fi
trap 'rmdir "$lock_dir"' EXIT

cd "$project_root"
/Users/christophercook/.local/bin/npm run build
launchctl kickstart -k "gui/$(id -u)/com.mixedmakershop.local-web"
echo "Rebuilt Mixed Maker Shop and restarted the local production server."

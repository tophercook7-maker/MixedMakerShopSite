#!/bin/zsh
set -euo pipefail

export PATH="/Users/christophercook/.local/bin:/opt/homebrew/bin:/usr/bin:/bin"
cd /Users/christophercook/Projects/MixedMakerShopSite/next-app
exec /Users/christophercook/.local/bin/npm run start -- --hostname 0.0.0.0 --port 3001

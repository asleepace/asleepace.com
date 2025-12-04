#!/bin/bash
#
# NOTE: This is the latest deploy script which should be called manualy
# and not from CI/CD.
#
#   bun run deploy:fast
#

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Stash and update
git stash
git fetch origin
git pull origin $(git branch --show-current)  # Pull current branch explicitly

# Build
bun install
bun run build

# Zero-downtime restart
pm2 reload asleepace.com
pm2 reload stock-background-sync

# Verify processes are running
pm2 status

echo "✅ Deploy complete!"
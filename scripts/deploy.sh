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
pm2 restart asleepace.com
pm2 restart stock-background-sync

# Verify processes are running
pm2 status

# Print last commit
echo "+ --------------------[ Last Commit ]----------------------- +"
git log | head
echo "+ ---------------------------------------------------------- +"

echo "✅ Deploy complete!"
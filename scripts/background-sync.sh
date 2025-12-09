#!/bin/bash

# DESCRIPTION:
#
# Trigger this script to run with a pm2 cron job:
#
#   pm2 start scripts/background-sync.sh \
#     --name stock-background-sync \
#     --cron "*/15 * * * *" \
#     --no-autorestart
#
# or use the npm script
#
#   bun run background:jobs
#

while true; do
  echo "[$(date)] background sync triggered"
  curl -s https://asleepace.com/api/stocks/background-sync
  sleep 900  # 15 minutes
done

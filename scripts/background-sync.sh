#!/bin/bash

# DESCRIPTION:
#
# Trigger this script to run with a pm2 Chron job:
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

# Background sync script - hits the API endpoint every 15 mins
curl -s https://asleepace.com/api/stocks/background-sync

# Optional: Log the result
echo "[$(date)] Background sync triggered" >> /var/log/stock-sync.log

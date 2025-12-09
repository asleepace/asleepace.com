#!/bin/bash
# Runs via crontab every 15 mins:
# */15 * * * * /root/asleepace.com/scripts/background-sync.sh >> /var/log/stock-sync.log 2>&1

set -e

# cleanup puppeteer files
echo "[background-sync] $(date) deleting /tmp/puppeteer_wsb_* files ..."
rm -rf /tmp/puppeteer_wsb_*

# trigger backgroud sync endpoint
echo "[background-sync] $(date) triggering ..."
response=$(curl -sf https://asleepace.com/api/stocks/background-sync)

# output response
echo "[background-sync] $(date) done: $response"

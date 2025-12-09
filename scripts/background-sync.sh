#!/bin/bash
# Runs via crontab every 15 mins:
# */15 * * * * /root/asleepace.com/scripts/background-sync.sh >> /var/log/stock-sync.log 2>&1

DIM='\033[2;90m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

BG_SYNC_URL=https://asleepace.com/api/stocks/background-sync

set -e

echo -e "${DIM}───────────────────────────────────────${NC}"
echo -e "${DIM}[background-sync]${NC} $(date)"
echo -e "${DIM}───────────────────────────────────────${NC}"

# cleanup puppeteer files
echo -e "${DIM}[cleanup]${NC} deleting ${CYAN}/tmp/puppeteer_wsb_*${NC}"
rm -rf /tmp/puppeteer_wsb_*

# trigger background sync endpoint
echo -e "${DIM}[fetch]${NC} ${CYAN}${BG_SYNC_URL}${NC}"
response=$(curl -sf "$BG_SYNC_URL")
echo -e "${DIM}[response]${NC} $response"

# system stats
echo -e "${DIM}───────────────────────────────────────${NC}"
echo -e "${DIM}[stats]${NC}"

cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
mem=$(free -m | awk '/Mem:/ {printf "%.1f%% (%dMB / %dMB)", $3/$2*100, $3, $2}')
disk=$(df -h / | awk 'NR==2 {printf "%s (%s / %s)", $5, $3, $2}')
load=$(uptime | awk -F'load average:' '{print $2}' | xargs)

echo -e "  ${DIM}CPU:${NC}  $cpu%"
echo -e "  ${DIM}MEM:${NC}  $mem"
echo -e "  ${DIM}DISK:${NC} $disk"
echo -e "  ${DIM}LOAD:${NC} $load"

echo -e "${DIM}───────────────────────────────────────${NC}"
echo -e "${GREEN}[done]${NC}"

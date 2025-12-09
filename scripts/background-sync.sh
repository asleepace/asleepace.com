#!/bin/bash
# Runs via crontab every 15 mins:
# */15 * * * * /root/asleepace.com/scripts/background-sync.sh >> /var/log/stock-sync.log 2>&1

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
INDIGO='\033[38;5;54m'
DIM='\033[2m'
GRAY='\033[0;90m'
BG='\033[2;90m'
NC='\033[0m'

BG_SYNC_URL=https://asleepace.com/api/stocks/background-sync
START_TIME=$(date +%s)

set -e

format_date() {
  date +"%m-%d-%Y %-I:%M %p"
}

echo -e "${BG}───────────────────────────────────────${NC}"
echo -e "${BG}[background-sync]${NC} $(format_date)"
echo -e "${BG}───────────────────────────────────────${NC}"

# cleanup puppeteer files
echo -e "${BG}[cleanup]${NC} deleting ${CYAN}/tmp/puppeteer_wsb_*${NC}"
rm -rf /tmp/puppeteer_wsb_*

# trigger background sync endpoint
echo -e "${BG}[fetch]${NC} ${CYAN}${BG_SYNC_URL}${NC}"
response=$(curl -sf "$BG_SYNC_URL") || response="${RED}failed${NC}"
echo -e "${BG}[response]${NC} $response"

# system stats
echo -e "${BG}───────────────────────────────────────${NC}"
echo -e "${BG}[stats]${NC}"

cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
mem=$(free -m | awk '/Mem:/ {printf "%.1f%% (%dMB / %dMB)", $3/$2*100, $3, $2}')
disk=$(df -h / | awk 'NR==2 {printf "%s (%s / %s)", $5, $3, $2}')
load=$(uptime | awk -F'load average:' '{print $2}' | xargs)

echo -e "  ${BG}CPU:${NC}  ${CYAN}$cpu%${NC}"
echo -e "  ${BG}MEM:${NC}  ${CYAN}$mem${NC}"
echo -e "  ${BG}DISK:${NC} ${CYAN}$disk${NC}"
echo -e "  ${BG}LOAD:${NC} ${CYAN}$load${NC}"

# done
ELAPSED=$(($(date +%s) - START_TIME))
echo -e "${BG}───────────────────────────────────────${NC}"
echo -e "${BG}[background-sync]${NC} finished ${BG}${ELAPSED}s${NC}"

#!/usr/bin/env bash

# Define ANSI escape codes for colors
RESET="\033[0m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
CYAN="\033[36m"
WHITE="\033[37m"


echo -e "\n\n${MAGENTA}deploy${WHITE}\t-  starting...\n\n"

set -e

npm run build

echo -e "\n\n${MAGENTA}deploy${WHITE}\t-  restarting...\n\n"

pm2 restart "asleepace-web-app"

echo -e "\n\n${MAGENTA}deploy${WHITE}\t-  done!${RESET}\n\n"

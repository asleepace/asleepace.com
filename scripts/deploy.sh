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

set -e

echo -e "\n${MAGENTA}deploy${WHITE}\t-  fetching updates...\n${CLEAR}"

git fetch origin
git checkout main
git pull

echo -e "\n${MAGENTA}deploy${WHITE}\t-  installing node modules...\n${CLEAR}"

npm install

echo -e "\n${MAGENTA}deploy${WHITE}\t-  building application...\n${CLEAR}"

npm run build

echo -e "\n${MAGENTA}deploy${WHITE}\t-  restarting server...\n${CLEAR}"

pm2 restart "asleepace-web-app"

echo -e "\n${MAGENTA}deploy${WHITE}\t-  success!\n${CLEAR}"

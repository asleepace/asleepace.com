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

# early exit if any command fails
set -e

# pretty print function for output
pretty_print() {
  local text="$1"
  echo -e "\n\n${MAGENTA} • deploy ${RESET}  -  ${WHITE}${text}${RESET}\n\n"
}

pretty_print "fetching latest changes from git..."

git fetch origin
git checkout main
git pull

pretty_print "installing ASDF plugins..."

asdf install

pretty_print "installing node modules..."

bun run install

pretty_print "building application..."

bun run build

pretty_print "building backend application"

pretty_print "restarting server..."

pm2 restart "asleepace.com"
pm2 restart "asleepace-backend"

pretty_print "success!"

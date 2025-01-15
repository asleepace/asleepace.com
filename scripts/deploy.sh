#!/usr/bin/env zsh

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
  echo -e "\n${MAGENTA} • deploy ${RESET}  -  ${WHITE}${text}${RESET}\n"
}

# print some memory stats
pretty_print "[memory] $(free -h)"
pretty_print "[disk] $(df -h)"

pretty_print "[1/5] fetching latest changes from git..."

git fetch origin
git checkout main
git pull

pretty_print "[2/5] installing ASDF plugins..."

asdf install

pretty_print "[3/5] installing node modules..."

bun run install

pretty_print "[4/5] building application..."

bun run build:tailwind
bun run build:debug

pretty_print "[5/5] restarting server..."

pm2 restart "asleepace.com"

pretty_print "[ ✅ ] success!"

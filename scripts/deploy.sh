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
  echo -e "\n${MAGENTA} • deploy ${RESET}  -  ${WHITE}${text}${RESET}"
}

# print some memory stats
pretty_print "[💽] $(free -h)"
pretty_print "[💾] $(df -h)"

pretty_print "[⛳] fetching latest changes from git..."

# pull latest changes from Github
git fetch origin
git status --short

# stash any local changes
if ! git diff-index --quiet HEAD --; then
    pretty_print "[📚] stashing local changes..."
    git stash push -m "Auto-stash before deploy $(date)"
fi

# pull latest changes from main
git checkout main
git pull origin main

pretty_print "[🚀] installing environment..."

# asdf install any deps
asdf install

pretty_print "[📦] installing node modules..."

# install node modules
bun i

pretty_print "[🎨] building tailwind styles..."

# build tailwind and project
bun run build:tailwind

pretty_print "[🔨] building application..."

bun run build

pretty_print "[🚀] restarting server..."

# restart pm2 server
pm2 restart "asleepace.com"

pretty_print "[✅] success!"

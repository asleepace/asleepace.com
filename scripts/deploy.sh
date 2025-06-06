#!/usr/bin/env bash

# custom ansi colors
RESET="\033[0m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
PURPLE="\033[95m"
CYAN="\033[36m"
WHITE="\033[37m"
DIM="\033[2m"
DIM_GRAY="\033[2;37m"

# early exit if any command fails
set -e

# pretty print function for output
pp() {
  local text="$1"
  echo -e "${RESET}${DIM}$(date +%H:%M:%S)${RESET} ${CYAN}[deploy]${PURPLE} ${text}${RESET}${DIM_GRAY}"
}

reset_output() {
  echo "${RESET}"
}

# print some memory stats
pp "📊 current memory usage: \n${DIM_GRAY}$(free -h)${RESET}"
pp "💽 current disk usage: \n${DIM_GRAY}$(df -h)${RESET}"
pp "⛳ fetching latest changes from git..."

# pull latest changes from Github
git fetch origin
git status --short

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)

# Stash any local changes (including untracked files)
if ! git diff-index --quiet HEAD -- || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    pp "📚 stashing local changes and untracked files..."
    git stash push --include-untracked -m "auto-stash before deploy $(date)"
fi

# Ensure we're on main branch and reset to match remote exactly
git checkout main
git reset --hard origin/main

# Clean any remaining untracked files
git clean -fd

pp "⚙️ installing environment..."

# asdf install any deps
asdf install

pp "📦 installing packages..."

# install node modules
bun i

pp "🎨 bundling styles..."

# build tailwind and project
bun run build:tailwind

pp "🛠️ building application..."

# build astro project
bun run build

pp "🔋 restarting server..."

# restart pm2 server
pm2 restart "asleepace.com"

pp "📋 ${YELLOW}$(git log --oneline -1)${RESET}"
pp "📅 ${WHITE}$(date)${RESET}"
pp "✅ success!"
reset_output
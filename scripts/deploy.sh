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
pp() {
  local text="$1"
  echo -e "\n${GREEN} • ${text}${RESET}"
}

# print some memory stats
pp "📊 current memory usage: \n$(free -h)"
pp "💽 current disk usage: \n$(df -h)"
pp "⛳ fetching latest changes from git..."

# pull latest changes from Github
git fetch origin
git status --short

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)

# Stash any local changes (including untracked files)
if ! git diff-index --quiet HEAD -- || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    pretty_print "📚 stashing local changes and untracked files..."
    git stash push --include-untracked -m "Auto-stash before deploy $(date)"
fi

# Ensure we're on main branch and reset to match remote exactly
pp "🔄 switching to main branch and syncing with remote..."
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

pp "📋 current commit: $(git log --oneline -1)"
pp "🕒 deployed at: $(date)"
pp "✅ success!"

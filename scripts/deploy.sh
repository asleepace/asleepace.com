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
  echo -e "\n${GREEN} • ${text}${RESET}"
}

# print some memory stats
pretty_print "📊 current memory usage: \n$(free -h)"
pretty_print "💽 current disk usage: \n$(df -h)"
pretty_print "⛳ fetching latest changes from git..."

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
pretty_print "🔄 switching to main branch and syncing with remote..."
git checkout main
git reset --hard origin/main

# Clean any remaining untracked files
git clean -fd

pretty_print "🚀 installing environment..."

# asdf install any deps
asdf install

pretty_print "📦 installing node modules..."

# install node modules
bun i

pretty_print "🎨 building tailwind styles..."

# build tailwind and project
bun run build:tailwind

pretty_print "🔨 building application..."

bun run build

pretty_print "🚀 restarting server..."

# restart pm2 server
pm2 restart "asleepace.com"

pretty_print "📋 current commit: $(git log --oneline -1)"
pretty_print "✅ success!"

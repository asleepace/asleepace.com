#!/usr/bin/env bash

echo("[deploy] starting...")

set -e

echo("[deploy] building...")

npm run build

echo("[deploy] restarting...")

pm2 restart "asleepace-web-app"

echo("[deploy] done!")

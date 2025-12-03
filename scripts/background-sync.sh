#!/bin/bash

# Background sync script - hits the API endpoint every 15 mins
curl -s https://asleepace.com/api/stocks/background-sync

# Optional: Log the result
echo "[$(date)] Background sync triggered" >> /var/log/stock-sync.log
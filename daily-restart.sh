#!/bin/bash

# Daily restart script for Trackmania bot to prevent DNS staleness
# Add this to your crontab: 0 4 * * * /home/thutchens/trackmania/montana-trackmania-bot/daily-restart.sh

cd /home/thutchens/trackmania/montana-trackmania-bot

echo "$(date): Starting daily container restart to refresh DNS and network stack"

# Check if container is running
if docker compose ps | grep -q "running"; then
    echo "$(date): Container is running, performing graceful restart"
    
    # Graceful restart - this preserves volumes and network config
    docker compose restart
    
    # Wait for it to come back up
    sleep 30
    
    # Check if it's healthy
    if docker compose ps | grep -q "healthy\|running"; then
        echo "$(date): Container restart successful"
    else
        echo "$(date): Container restart failed, trying full rebuild"
        docker compose down
        docker compose up -d
    fi
else
    echo "$(date): Container not running, starting it"
    docker compose up -d
fi

echo "$(date): Daily restart completed"

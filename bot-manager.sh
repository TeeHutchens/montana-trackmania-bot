#!/bin/bash

# Montana Trackmania Bot - Docker Management Script
# Usage: ./bot-manager.sh [start|stop|restart|logs|build|status]

BOT_NAME="montana-trackmania-bot"

case "$1" in
    start)
        echo "🚀 Starting Montana Trackmania Bot..."
        docker compose up -d
        echo "✅ Bot started! Use './bot-manager.sh logs' to view logs."
        ;;
    
    stop)
        echo "🛑 Stopping Montana Trackmania Bot..."
        docker compose down
        echo "✅ Bot stopped."
        ;;
    
    restart)
        echo "🔄 Restarting Montana Trackmania Bot..."
        docker compose down
        docker compose up -d
        echo "✅ Bot restarted!"
        ;;
    
    logs)
        echo "📋 Showing bot logs (Ctrl+C to exit)..."
        docker compose logs -f
        ;;
    
    build)
        echo "🔨 Building bot image..."
        docker compose build --no-cache
        echo "✅ Build complete!"
        ;;
    
    status)
        echo "📊 Bot status:"
        docker compose ps
        echo ""
        echo "📈 Resource usage:"
        docker stats $BOT_NAME --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
        ;;
    
    update)
        echo "🔄 Updating bot..."
        git pull
        docker compose build --no-cache
        docker compose down
        docker compose up -d
        echo "✅ Bot updated and restarted!"
        ;;
    
    shell)
        echo "🐚 Opening shell in bot container..."
        docker exec -it $BOT_NAME /bin/sh
        ;;
    
    *)
        echo "Montana Trackmania Bot - Docker Manager"
        echo ""
        echo "Usage: $0 {start|stop|restart|logs|build|status|update|shell}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the bot"
        echo "  stop    - Stop the bot"
        echo "  restart - Restart the bot"
        echo "  logs    - View bot logs"
        echo "  build   - Rebuild bot image"
        echo "  status  - Show bot status and resource usage"
        echo "  update  - Pull latest code and restart"
        echo "  shell   - Open shell in bot container"
        exit 1
        ;;
esac

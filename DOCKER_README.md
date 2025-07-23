# 🏔️ Montana Trackmania Bot - Docker Deployment

A lightweight Discord bot for Montana Trackmania community, optimized for Raspberry Pi 5.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Raspberry Pi 5 (or any ARM64/AMD64 system)
- Discord bot token
- Ubisoft/Trackmania account

### 1. Setup Environment
```bash
# Clone the repository
git clone <your-repo-url>
cd montana-trackmania-bot

# Copy and configure environment file
cp .env.example .env
nano .env  # Fill in your Discord token and Ubisoft credentials
```

### 2. Build and Start
```bash
# Using the management script (recommended)
./bot-manager.sh build
./bot-manager.sh start

# Or using docker compose directly
docker compose up -d
```

### 3. Monitor
```bash
# View logs
./bot-manager.sh logs

# Check status
./bot-manager.sh status
```

## 📋 Management Commands

Use the `bot-manager.sh` script for easy management:

```bash
./bot-manager.sh start     # Start the bot
./bot-manager.sh stop      # Stop the bot
./bot-manager.sh restart   # Restart the bot
./bot-manager.sh logs      # View logs
./bot-manager.sh build     # Rebuild image
./bot-manager.sh status    # Show status & resource usage
./bot-manager.sh update    # Pull updates and restart
./bot-manager.sh shell     # Open shell in container
```

## 🔧 Configuration

### Environment Variables (.env file)
```env
DISCORD_TOKEN=your_discord_token_here
UBI_USERNAME=your_ubisoft_username
UBI_PASSWORD=your_ubisoft_password
LOG_LEVEL=info
```

### Resource Limits (Raspberry Pi 5 optimized)
- **Memory Limit**: 512MB
- **CPU Limit**: 1.0 core
- **Reserved**: 256MB RAM, 0.5 CPU

## 📁 Data Persistence

The bot uses Docker volumes for data persistence:
- `./cache/` - Bot cache files (player data, map info)
- `./logs/` - Log files (optional)

## 🔍 Troubleshooting

### Check Bot Status
```bash
./bot-manager.sh status
```

### View Logs
```bash
./bot-manager.sh logs
```

### Restart Bot
```bash
./bot-manager.sh restart
```

### Rebuild Image (after code changes)
```bash
./bot-manager.sh build
./bot-manager.sh restart
```

## 🏥 Health Monitoring

The Docker container includes health checks that run every 60 seconds. You can check health status:

```bash
docker ps  # Look for "healthy" status
```

## 🔄 Updates

To update the bot with new code:
```bash
./bot-manager.sh update
```

This will:
1. Pull latest code from git
2. Rebuild the Docker image
3. Restart the bot with new code

## 🐛 Debug Mode

To access the container shell for debugging:
```bash
./bot-manager.sh shell
```

## 📊 Resource Usage

Optimized for Raspberry Pi 5:
- **Image Size**: ~150MB (Alpine Linux base)
- **RAM Usage**: ~100-256MB during operation
- **CPU Usage**: Low (event-driven)
- **Disk Usage**: ~50MB + cache files

## 🔐 Security

- Runs as non-root user (`botuser`)
- Uses Alpine Linux (minimal attack surface)
- Environment variables for sensitive data
- No unnecessary ports exposed

## 🎯 Features

- ✅ 45-minute map caching system
- ✅ Player data caching (30 days)
- ✅ Montana zone leaderboards
- ✅ Weekly Shorts tracking
- ✅ Optimized authentication (1 login per session)
- ✅ Clean track name display (removes color codes)
- ✅ ARM64 compatible (Raspberry Pi 5)
- ✅ Lightweight Docker image
- ✅ Auto-restart on failure

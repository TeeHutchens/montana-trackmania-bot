# 🎉 Montana Trackmania Bot - Docker Deployment Complete!

## 📊 **Build Results**
- ✅ **Docker Image**: Successfully built for ARM64 (Raspberry Pi 5 compatible)
- ✅ **Image Size**: 185MB (lightweight Alpine Linux base)
- ✅ **Architecture**: Multi-platform (ARM64/AMD64)
- ✅ **Security**: Non-root user, minimal attack surface

## 🚀 **Quick Deployment Guide**

### **Step 1: Setup Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

Required values in `.env`:
```env
DISCORD_TOKEN=your_discord_bot_token
UBI_USERNAME=your_ubisoft_username  
UBI_PASSWORD=your_ubisoft_password
```

### **Step 2: Deploy with Docker Compose**
```bash
# Build and start
./bot-manager.sh build
./bot-manager.sh start

# View logs
./bot-manager.sh logs

# Check status
./bot-manager.sh status
```

### **Step 3: Verify Bot is Working**
- Check Discord bot appears online
- Try `/shorts` command to test weekly shorts
- Monitor logs for any errors

## 🛠️ **Management Commands**

| Command | Description |
|---------|-------------|
| `./bot-manager.sh start` | Start the bot |
| `./bot-manager.sh stop` | Stop the bot |
| `./bot-manager.sh restart` | Restart the bot |
| `./bot-manager.sh logs` | View real-time logs |
| `./bot-manager.sh status` | Show status & resource usage |
| `./bot-manager.sh build` | Rebuild Docker image |
| `./bot-manager.sh update` | Pull code updates & restart |

## 🏥 **Monitoring & Health**

The container includes:
- **Health checks** every 60 seconds
- **Auto-restart** on failure (`unless-stopped`)
- **Resource limits** (512MB RAM, 1 CPU core)
- **Log rotation** (max 10MB per file, 3 files)

## 📈 **Performance Optimizations**

### **For Raspberry Pi 5:**
- **Alpine Linux**: Minimal 185MB image
- **ARM64 native**: No emulation overhead  
- **Memory efficient**: ~100-256MB usage
- **Cache persistence**: Data survives restarts
- **Single authentication**: Reduced API calls

### **Features Working:**
- ✅ 45-minute map caching
- ✅ 30-day player caching  
- ✅ Clean track names (color code removal)
- ✅ Montana zone leaderboards
- ✅ Weekly Shorts tracking
- ✅ Optimized API authentication

## 🔧 **Troubleshooting**

### **Bot won't start:**
```bash
./bot-manager.sh logs  # Check error messages
docker ps -a           # Check container status
```

### **Discord connection issues:**
- Verify `DISCORD_TOKEN` in `.env`
- Check bot permissions in Discord server

### **Trackmania API issues:**
- Verify `UBI_USERNAME` and `UBI_PASSWORD` in `.env`
- Check logs for authentication errors

### **High memory usage:**
```bash
./bot-manager.sh status  # Check current usage
# Restart if needed:
./bot-manager.sh restart
```

## 🔄 **Updates & Maintenance**

### **Update bot code:**
```bash
./bot-manager.sh update
```

### **Manual update:**
```bash
git pull
docker-compose build --no-cache
docker-compose down && docker-compose up -d
```

### **Clear cache (if needed):**
```bash
./bot-manager.sh shell
node cache/cache-manager.js clear all
exit
```

## 📱 **Discord Commands**

Once deployed, your bot supports:
- `/shorts` - Weekly Shorts leaderboards
- `/player <name>` - Player profile lookup
- `/leaderboard <map>` - Map leaderboards
- And more based on your bot's configuration

## 🎯 **Success Metrics**

Your bot is successfully deployed when:
- ✅ Container shows "healthy" status
- ✅ Bot appears online in Discord
- ✅ `/shorts` command returns proper track names
- ✅ Memory usage stays under 256MB
- ✅ No authentication errors in logs

---

**🏔️ Montana Trackmania Bot is now ready for production!**

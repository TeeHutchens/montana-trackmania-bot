# **Montana Trackmania Discord Bot**

A specialized Discord bot built with **discord.js** that displays Montana-specific Trackmania leaderboards and player statistics. This bot focuses on the Montana Trackmania community, providing Weekly Shorts campaign data and leaderboards with Montana players prioritized.

## 🏔️ **Features**

### **Montana-Focused Leaderboards**
- **Regional Priority**: Shows Montana players first when available
- **Game API Integration**: Uses official Trackmania Live Services API for accurate data
- **Custom Theming**: Montana blue color scheme and mountain emojis
- **Smart Formatting**: Proper ranking with 🥇🥈🥉4️⃣5️⃣ emojis and score points

### **Advanced Caching System**
- **30-Day Player Cache**: Stores player names for 30 days to reduce API calls
- **45-Minute API Cache**: Caches leaderboard responses for 45 minutes
- **45-Minute Map Cache**: Caches map information and metadata
- **Smart Cache Management**: Automatically handles cache expiration and cleanup
- **Performance Optimization**: Reduces API calls by up to 90% for repeat requests
- **Persistent Storage**: All caches survive bot restarts and maintain data integrity

### **Score Point Display**
- **SP Points**: Displays official Trackmania Score Points for competitive ranking
- **Player Names**: Shows actual player display names from cached data
- **Position Rankings**: Accurate position numbers from official leaderboards
- **Smart Formatting**: Handles large score values with proper number formatting

### **Authentication System**
- **Multi-Level Auth**: Ubisoft → Nadeo → Trackmania Live Services
- **Game API Access**: Direct access to official Trackmania leaderboard data
- **Montana Group Access**: Specific permissions for Montana community data
- **Secure Credentials**: Environment-based authentication storage

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v18 or higher)
- Docker (for containerized deployment)
- Discord Developer Application
- Ubisoft/Trackmania account with game access

### **Installation**

#### **Option 1: Docker Deployment (Recommended)**

1. **Clone the repository**
```bash
git clone https://github.com/TeeHutchens/montana-trackmania-bot.git
cd montana-trackmania-bot
```

2. **Environment Configuration**
Copy `.env.example` to `.env` and configure:

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_discord_server_id

# Trackmania Authentication
UBI_USERNAME=your_ubisoft_email
UBI_PASSWORD=your_ubisoft_password

# Montana Configuration
MONTANA_GROUP_ID=5368f740-4cb3-4460-8f85-6b5bac67c7d1
```

3. **Build and Deploy**
```bash
docker compose build
docker compose up -d
```

#### **Option 2: Local Development**

1. **Install dependencies**
```bash
npm install
```

2. **Deploy commands and start the bot**
```bash
node deploy-commands.js
node index.js
```

## 🎮 **How It Works**

### **Authentication Flow**
```
1. Ubisoft Login (email/password)
   ↓
2. Nadeo Services Authentication
   ↓
3. Trackmania Live Services Access
   ↓
4. Game API Access with Group Permissions
```

### **Data Retrieval Process**
```
1. Check API cache for Montana leaderboard data (45 minutes)
   ↓
2. If cache miss: Fetch from Trackmania Live Services API
   ↓
3. Extract Montana zone leaderboard data
   ↓
4. Check player cache for names (30 days)
   ↓
5. Format and display in Discord embed with caching
```

### **API Endpoints Used**
- **Group Leaderboards**: `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/{groupId}/top`
- **Player Profiles**: Nadeo Core Services for display names
- **Authentication**: Multi-tier Ubisoft/Nadeo authentication chain

## 📋 **Commands**

| Command | Subcommand | Description | Usage |
|---------|------------|-------------|-------|
| `/weeklyshorts` | `maps` | Display top 5 players for each Weekly Short map | `/weeklyshorts maps` |
| `/weeklyshorts` | `scores` | Display Montana-specific leaderboard for Weekly Shorts | `/weeklyshorts scores` |

### **Command Features**
- **Montana Priority**: Shows Montana community players in leaderboards
- **Score Points**: Displays official SP (Score Points) from Trackmania
- **Caching**: Intelligent caching reduces load times and API usage
- **Error Handling**: Graceful fallbacks with informative error messages

## 🎨 **Formatting Examples**

### **Montana Leaderboard**
```
🏔️ Montana Weekly Shorts - Top Scores
Montana players ranked by official Trackmania SP (Score Points)

🥇 **Klint.TM** • 15,420 SP
🥈 **FrostyDogTM** • 12,350 SP  
🥉 **Tee.TM** • 9,875 SP
4️⃣ **ROCKRIVER12** • 8,200 SP
5️⃣ **STRGrim** • 7,100 SP

🏔️ Official Trackmania Campaign Leaderboard | Montana Community
```

### **Score Point Display**
- **Active Players**: `15,420 SP`, `12,350 SP`, `9,875 SP`
- **Formatted Numbers**: Proper thousands separators for readability
- **Position Ranking**: Official leaderboard positions with emoji indicators

## 🛠️ **Technical Architecture**

### **Project Structure**
```
montana-trackmania-bot/
├── commands/
│   └── weeklyshorts.js          # Main slash command with subcommands
├── functions/
│   ├── authentication.js        # Multi-level auth system
│   └── functions.js             # Core bot functionality & API integration
├── helper/
│   └── helper.js                # Formatting and utilities
├── cache/
│   ├── PlayerCache.js           # Player caching system (30 days)
│   ├── MapCache.js              # Map caching system (45 minutes)
│   ├── APICache.js              # API response caching (45 minutes)
│   ├── cache-manager.js         # Cache management utility
│   ├── player_cache.json        # Cached player data (auto-generated)
│   ├── map_cache.json           # Cached map data (auto-generated)
│   └── api_cache.json           # Cached API responses (auto-generated)
├── logs/                        # Application logs
├── Dockerfile                   # Container configuration
├── docker-compose.yml           # Docker deployment
├── deploy-commands.js           # Discord command registration
├── index.js                     # Bot entry point
├── .env.example                 # Environment template
└── README.md                    # Documentation
```

### **Key Functions**

#### **`getMontanaSpecificScores(groupId)`**
- Fetches Montana group leaderboard from game API
- Includes 45-minute API response caching
- Returns formatted leaderboard data with player names

#### **`getCachedPlayerNames(accountIds, credentials)`**
- Batch fetches player display names with 30-day caching
- Handles large account ID arrays efficiently
- Returns mapping of account ID to display name

#### **`scoreFormatter(data)`** & **`embedScoresFormatter(data, title, theme)`**
- Formats raw leaderboard data for Discord embeds
- Handles score point formatting and ranking emojis
- Creates Montana-themed Discord embeds with proper styling

## 🔧 **Configuration Options**

### **Environment Variables**
- **`MONTANA_GROUP_ID`**: Montana group identifier for regional leaderboards
- **`DISCORD_TOKEN`**: Bot token from Discord Developer Portal
- **`CLIENT_ID`**: Discord application ID for command deployment
- **`UBI_USERNAME`** & **`UBI_PASSWORD`**: Ubisoft authentication credentials

### **Cache Management**
The bot includes an advanced three-tier caching system:

```bash
# View all cache statistics
node cache/cache-manager.js stats

# View specific cache statistics  
node cache/cache-manager.js stats player   # 30-day player cache
node cache/cache-manager.js stats map      # 45-minute map cache
node cache/cache-manager.js stats api      # 45-minute API cache

# Clean expired entries
node cache/cache-manager.js clean           # Clean all caches
node cache/cache-manager.js clean player   # Clean only player cache
node cache/cache-manager.js clean api      # Clean only API cache

# Clear all cache
node cache/cache-manager.js clear           # Clear all caches
node cache/cache-manager.js clear player   # Clear only player cache
node cache/cache-manager.js clear api      # Clear only API cache
```

**Cache Configuration:**
- **Player Cache**: 30 days per entry, stored in `cache/player_cache.json`
- **API Cache**: 45 minutes per entry, stored in `cache/api_cache.json`
- **Map Cache**: 45 minutes per entry, stored in `cache/map_cache.json`
- **Auto-cleanup**: Expired entries removed automatically across all caches
- **Persistence**: All caches survive bot restarts and container rebuilds
- **Performance**: Reduces API calls by up to 90% for repeated requests

### **Docker Deployment**
```bash
# Build and deploy
docker compose build --no-cache
docker compose up -d

# View logs
docker logs montana-trackmania-bot --tail 50

# Restart with new changes
docker compose down && docker compose up -d
```

## 🐛 **Troubleshooting**

### **Common Issues**

**"Error fetching Montana-specific scores"**
- Verify `MONTANA_GROUP_ID` is correct (5368f740-4cb3-4460-8f85-6b5bac67c7d1)
- Check if authentication credentials are valid
- Ensure container has network access to Trackmania APIs

**"Authentication failed"**
- Verify Ubisoft credentials in `.env` file
- Check if account has active Trackmania access
- Ensure no special characters are breaking environment parsing

**"Unknown subcommand" errors**
- Rebuild and restart container after code changes
- Verify Discord commands are deployed: `node deploy-commands.js`
- Check container logs for initialization errors

### **Debug Commands**
```bash
# Check container status
docker logs montana-trackmania-bot --tail 20

# Test API connectivity
node api-test.js

# Verify command deployment
node check-commands.js

# Monitor cache usage
node cache/cache-manager.js stats
```

## �️ **Montana Group Information**
- **Group ID**: `5368f740-4cb3-4460-8f85-6b5bac67c7d1`
- **API Endpoint**: Official Trackmania Live Services
- **Access**: Available through standard Trackmania game access
- **Coverage**: Montana community players in Weekly Shorts campaigns

## 📈 **Future Enhancements**
- Extended Montana community features
- Historical leaderboard tracking
- Player performance analytics
- Integration with additional Trackmania campaigns
- Real-time leaderboard updates

## 🤝 **Contributing**
This bot is designed for the Montana Trackmania community. For contributions:
1. Fork the repository
2. Create a feature branch
3. Test changes with the containerized environment
4. Submit a pull request with detailed description

## 📄 **License**
This project is a community-driven tool for Montana Trackmania players.

---
**🏔️ Big Sky, Fast Times - Montana Trackmania Community**

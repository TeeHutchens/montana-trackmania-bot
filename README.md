# **Montana Trackmania Discord Bot**

A specialized Discord bot built with **discord.js** that displays Montana-specific Trackmania leaderboards and player statistics. This bot focuses on the Montana Trackmania community, providing Weekly Shorts leaderboards with Montana players prioritized, while falling back to world rankings when regional data is unavailable.

## 🏔️ **Features**

### **Montana-Focused Leaderboards**
- **Regional Priority**: Shows Montana players first when available
- **Fallback System**: Displays world leaderboards when no Montana players are found
- **Custom Theming**: Montana blue color scheme and mountain emojis
- **Smart Formatting**: Proper ranking with 🥇🥈🥉4️⃣5️⃣ emojis

### **Intelligent Caching System**
- **30-Day Player Cache**: Stores player names for 30 days to reduce API calls
- **45-Minute Map Cache**: Caches map information and metadata for 45 minutes
- **Smart Cache Management**: Automatically handles cache expiration and cleanup
- **Performance Optimization**: Reduces API calls by up to 80% for repeat requests
- **Persistent Storage**: Both caches survive bot restarts and maintain data integrity

### **Time Display**
- **Real Times**: Displays actual completion times (e.g., "35.420", "1:05.789")
- **SECRET Status**: Shows "SECRET" for players who haven't completed the map
- **Smart Formatting**: Handles minutes:seconds.milliseconds format

### **Authentication System**
- **Multi-Level Auth**: Ubisoft → Nadeo → Trackmania Live Services
- **Zone-Based Access**: Requires Montana zone permissions
- **Secure Credentials**: Base64 encoded authentication

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- Discord Developer Application
- Ubisoft/Trackmania account with Montana zone access

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/TeeHutchens/montana-trackmania-bot.git
cd montana-trackmania-bot
```

2. **Install dependencies**
```bash
npm install discord.js trackmania-api-node trackmania.io dotenv
```

3. **Environment Configuration**
Create a `.env` file in the project root:

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_discord_server_id

# Trackmania Authentication
UBI_USERNAME=your_ubisoft_email
UBI_PASSWORD=your_ubisoft_password

# Montana Configuration
GROUP_UID=3022e37a-7e13-11e8-8060-e284abfd2bc4

# Bot Configuration
ALLOWED_COMMANDS=weeklyshorts
```

### **Required Permissions**
Your Ubisoft account must have:
- **Trackmania access**: Valid game ownership
- **Montana zone access**: Purchase required for regional leaderboards
- **Live Services access**: Enabled through account settings

4. **Deploy commands and start the bot**
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
4. Zone-Based API Permissions
```

### **Data Retrieval Process**
```
1. Fetch Weekly Shorts maps from OpenPlanet API
   ↓
2. Get zone-based leaderboards (Montana: 3022e37a-7e13-11e8-8060-e284abfd2bc4)
   ↓
3. Extract Montana player account IDs
   ↓
4. Fetch player profiles and display names
   ↓
5. Format and display in Discord embed
```

### **API Endpoints Used**
- **Weekly Shorts**: `https://openplanet.dev/plugin/weeklyshorts/maps`
- **Zone Leaderboards**: Nadeo Live Services `/api/token/leaderboard/group/...`
- **Player Profiles**: Nadeo Core Services `/accounts/...`

## 📋 **Commands**

| Command | Description | Usage | Output |
|---------|-------------|-------|--------|
| `/weeklyshorts` | Display Montana Weekly Shorts leaderboards | `/weeklyshorts` | Montana-themed embeds with regional players |

### **Command Behavior**
- **Montana Players Found**: Shows Montana-specific leaderboard with blue theme
- **No Montana Players**: Falls back to world leaderboard with standard theme
- **Mixed Results**: Prioritizes Montana players, supplements with world rankings

## 🎨 **Formatting Examples**

### **Montana Leaderboard**
```
🏔️ Red Driveby - Montana Leaderboard
🏆 Montana Top Players
🥇 **Klint.TM** 35.420
🥈 **FrostyDogTM** SECRET
🥉 **Tee.TM** 1:05.789
4️⃣ **ROCKRIVER12** SECRET
5️⃣ **STRGrim** 2:15.999
```

### **Time Formatting**
- **Completed Times**: `35.420`, `1:05.789`, `2:15.999`
- **No Completion**: `SECRET`
- **Invalid Data**: `SECRET`

## 🛠️ **Technical Architecture**

### **Project Structure**
```
montana-trackmania-bot/
├── commands/
│   └── weeklyshorts.js          # Main slash command
├── functions/
│   ├── authentication.js        # Multi-level auth system
│   └── functions.js             # Core bot functionality
├── helper/
│   └── helper.js                # Formatting and utilities
├── cache/
│   ├── PlayerCache.js           # Player caching system (30 days)
│   ├── MapCache.js              # Map caching system (45 minutes)
│   ├── cache-manager.js         # Dual cache management utility
│   ├── player_cache.json        # Cached player data (auto-generated)
│   └── map_cache.json           # Cached map data (auto-generated)
├── test/                        # All test files
│   ├── README.md               # Test documentation
│   ├── test-formatter.js       # Format testing
│   ├── test-player-cache.js    # Player cache testing
│   ├── test-map-cache.js       # Map cache testing
│   ├── test-map-cache-comprehensive.js  # Full cache testing
│   └── ... (15+ other test files)
├── deploy-commands.js           # Command registration
├── index.js                     # Bot entry point
├── README.md                    # Main documentation  
└── package.json                 # Dependencies
```
```
montana-trackmania-bot/
├── commands/
│   └── weeklyshorts.js          # Main slash command
├── functions/
│   ├── authentication.js        # Multi-level auth system
│   └── functions.js             # Core bot functionality
├── helper/
│   └── helper.js                # Formatting and utilities
├── deploy-commands.js           # Command registration
├── index.js                     # Bot entry point
└── .env                         # Environment configuration
```

### **Key Functions**

#### **`getMontanaTopPlayerTimes(mapUid)`**
- Fetches Montana-specific leaderboard data
- Handles authentication and zone filtering
- Returns formatted player rankings

#### **`getCachedMapInfo(mapUid, apiCredentials)`**
- Fetches map information with 45-minute caching
- Returns map name, author ID, and cached author name
- Automatically cleans track names from hex color codes
- Significantly reduces API calls for repeated map requests

#### **`timeFormatter(value)`**
- Converts Trackmania time values to readable format
- Handles special cases (4294967295 = "SECRET")
- Formats as MM:SS.mmm or SS.mmm

#### **`recordPlacingFormatter(playerMap)`**
- Creates Discord-formatted leaderboard strings
- Assigns ranking emojis (🥇🥈🥉4️⃣5️⃣)
- Handles player name bolding

#### **`montanaEmbedFormatter(...)`**
- Creates Montana-themed Discord embeds
- Uses Montana blue color (#4A90E2)
- Includes mountain emojis and regional branding

## 🔧 **Configuration Options**

### **Environment Variables**
- **`GROUP_UID`**: Montana zone identifier (required for regional data)
- **`ALLOWED_COMMANDS`**: Comma-separated list of enabled commands
- **Authentication**: Ubisoft credentials for API access

### **Cache Management**
The bot includes an intelligent dual caching system for both player names and map information:

```bash
# View all cache statistics
node cache/cache-manager.js stats

# View specific cache statistics
node cache/cache-manager.js stats player  # 30-day player cache
node cache/cache-manager.js stats map     # 45-minute map cache

# Clean expired entries
node cache/cache-manager.js clean          # Clean both caches
node cache/cache-manager.js clean player  # Clean only player cache
node cache/cache-manager.js clean map     # Clean only map cache

# Clear all cache
node cache/cache-manager.js clear          # Clear both caches
node cache/cache-manager.js clear player  # Clear only player cache
node cache/cache-manager.js clear map     # Clear only map cache

# Show cached entries
node cache/cache-manager.js show           # Show both caches
node cache/cache-manager.js show player   # Show only player cache
node cache/cache-manager.js show map      # Show only map cache
```

**Cache Configuration:**
- **Player Cache**: 30 days per entry, stored in `cache/player_cache.json`
- **Map Cache**: 45 minutes per entry, stored in `cache/map_cache.json`
- **Auto-cleanup**: Expired entries removed automatically for both caches
- **Persistence**: Both caches survive bot restarts and maintain data integrity
- **Performance**: Reduces API calls by up to 80% for repeated requests

### **Customization**
- **Colors**: Modify embed colors in `helper.js`
- **Emojis**: Update ranking symbols in `recordPlacingFormatter`
- **Themes**: Adjust titles and footers in embed formatters

## 🐛 **Troubleshooting**

### **Common Issues**

**"No Montana players found"**
- Verify `GROUP_UID` is correct for Montana
- Check if account has Montana zone access
- Ensure authentication is working

**"Authentication failed"**
- Verify Ubisoft credentials in `.env`
- Check if account has Trackmania access
- Ensure no special characters in password

**"SECRET" showing for all players**
- This is normal for players who haven't completed the map
- Real completion times will show as formatted times

### **Debug Commands**
```bash
# Test time formatting
node test-real-times.js

# Test formatter functions
node test-formatter.js

# Preview Discord output
node final-discord-preview.js
```

## 🎯 **Montana Zone Information**
- **Zone ID**: `3022e37a-7e13-11e8-8060-e284abfd2bc4`
- **Region**: Montana, United States
- **Access**: Requires purchase through Trackmania account
- **Coverage**: State-wide Trackmania community

## 📈 **Future Enhancements**
- Additional Montana-specific commands
- Player statistics tracking
- Custom leaderboard categories
- Integration with Montana community events

## 🤝 **Contributing**
This bot is specifically designed for the Montana Trackmania community. For contributions or modifications, please consider the regional focus and community needs.

## 📄 **License**
This project is a community-driven tool for the Montana Trackmania players.

---
**🏔️ Big Sky, Fast Times - Montana Trackmania Community**

# Montana Trackmania Discord Bot

A Discord bot for the Montana Trackmania community. Displays leaderboard data for the current Weekly Shorts campaign and the current seasonal campaign, filtered exclusively to Montana-zone players.

---

## Commands

| Command | Description |
|---|---|
| `/weeklyshorts scores` | Montana SP leaderboard for the current Weekly Shorts campaign |
| `/weeklyshorts maps` | Per-track top-5 Montana times for each map in the current week |
| `/weeklyshorts track <week> <track>` | Montana times for a specific historical week and track number |
| `/campaign scores` | Montana SP leaderboard for the current seasonal campaign |
| `/campaign track <track>` | Montana times for a specific track in the current seasonal campaign |

---

## Architecture

### Authentication Flow

All API access goes through `functions/authentication.js` using a Nadeo service account:

1. `NADEO_LOGIN` / `NADEO_PASSWORD` → POST to Nadeo `/v2/authentication/token/basic` with audience `NadeoServices`
2. Same credentials → same endpoint with audience `NadeoLiveServices`
3. Player display names are fetched separately via `api.trackmania.com` OAuth2 `client_credentials` flow using `APP_IDENTIFIER` / `APP_SECRET`

The `APICredentials` array returned by `APILogin()`:
- `[1].accessToken` — NadeoServices token (used by `getMaps`, `getMapRecords`)
- `[2].accessToken` — NadeoLiveServices token (used in `nadeo_v1 t=` Authorization headers)
- `[3]` — raw NadeoLiveServices token string (used by `trackmania-api-node`)

### Key API Endpoints

All Nadeo Live Services requests use base URL `https://live-services.trackmania.nadeo.live`.

| Purpose | Endpoint |
|---|---|
| Current Weekly Shorts | `GET /api/campaign/weekly-shorts?offset=0&length=1` |
| Historical Weekly Shorts | `GET /api/campaign/weekly-shorts?offset=N&length=1` |
| Current seasonal campaign | `GET /api/campaign/official?offset=0&length=1` |
| Campaign SP leaderboard (Montana) | `GET /api/token/leaderboard/group/{seasonUid}/top?length=100&onlyWorld=false` |
| Per-map zone leaderboard | `GET /api/token/leaderboard/group/Personal_Best/map/{mapUid}/top?length=100` |
| Map info | `GET /api/token/map/{mapUid}` |
| Player display names (batch) | `GET https://api.trackmania.com/api/display-names?accountId[]=...` |

**Important:** Campaign leaderboard queries require `campaign.seasonUid` (UUID). Using `campaign.id` (numeric) or `campaign.uid` (undefined) will not work.

The zone leaderboard returns four nested zones: World → North America → United States → Montana. Each zone is capped at 5 players — this is an API limitation.

### Caching

Three cache layers, persisted to JSON files in `cache/`:

| Cache | File | TTL | Purpose |
|---|---|---|---|
| `PlayerCache` | `player_cache.json` | 365 days | Player display names by account ID |
| `MapCache` | `map_cache.json` | 45 minutes | Map name and author info by map UID |
| `APICache` | `api_cache.json` | 45 min / 1 hr | Full API responses (leaderboards, scores) |

Cache files inside the Docker container are owned by `botuser`. To edit them from the host, use `sudo`.

### File Structure

```
commands/
  weeklyshorts.js       — /weeklyshorts subcommands (maps, scores, track)
  campaigns.js          — /campaign subcommands (scores, track)
functions/
  functions.js          — all API logic and data fetching
  authentication.js     — Nadeo service account auth
helper/
  helper.js             — Discord embed formatters
cache/
  PlayerCache.js        — player name cache (365-day TTL)
  MapCache.js           — map info cache (45-min TTL)
  APICache.js           — API response cache (configurable TTL)
constants.js            — BOT_CONFIG.USER_AGENT string
index.js                — Discord client setup and command loader
deploy-commands.js      — registers slash commands with Discord API
docker-compose.yml      — container configuration
Dockerfile              — image build
daily-restart.sh        — cron-scheduled container restart (DNS refresh)
bot-manager.sh          — helper script for common Docker operations
```

---

## Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for production)
- A dedicated Nadeo service account (not your personal account)
- A Trackmania API application registered at `api.trackmania.com`
- A Discord application with a bot token

### Environment Variables

Create a `.env` file in the project root:

```env
# Discord
DISCORD_TOKEN=         # Bot token from Discord Developer Portal
CLIENT_ID=             # Discord application (client) ID
GUILD_ID=              # Discord server ID to register commands to

# Nadeo service account
NADEO_LOGIN=           # Nadeo service account username (e.g. service_MontanaBot)
NADEO_PASSWORD=        # Nadeo service account password

# api.trackmania.com OAuth2 application (for player display names)
APP_IDENTIFIER=        # OAuth2 client ID
APP_SECRET=            # OAuth2 client secret

# Comma-separated list of enabled slash commands
ALLOWED_COMMANDS=weeklyshorts,campaign
```

### Running Locally

```bash
npm install
node deploy-commands.js   # register slash commands with Discord (run once, or after command changes)
node index.js             # start the bot
```

### Running with Docker

```bash
docker compose up -d --build
```

The compose file mounts `./cache` as a volume so cached data survives container restarts.

### Deploying Slash Commands

Slash commands must be registered with Discord before they appear in the server. Run once after any changes to command names, subcommands, or options:

```bash
node deploy-commands.js
```

---

## Deployment

The bot runs as a Docker container. A cron job restarts it daily at 4 AM MDT to prevent DNS cache staleness:

```
0 4 * * * /path/to/daily-restart.sh >> restart.log 2>&1
```

Use `bot-manager.sh` for common operations:

```bash
./bot-manager.sh start    # start the container
./bot-manager.sh stop     # stop the container
./bot-manager.sh restart  # full down + up
./bot-manager.sh logs     # tail container logs
./bot-manager.sh status   # show container status and resource usage
./bot-manager.sh update   # git pull + rebuild + restart
./bot-manager.sh shell    # open a shell inside the running container
```

---

## Troubleshooting

**Authentication failed**
- Confirm `NADEO_LOGIN` and `NADEO_PASSWORD` are set correctly in `.env`
- The Nadeo service account must have an active Trackmania subscription

**Montana zone not found**
- The Nadeo leaderboard API returns a maximum of 5 players per zone. If no Montana players have scores on a map, the bot falls back to world rankings automatically.

**Slash commands not appearing in Discord**
- Re-run `node deploy-commands.js` — commands can take a few minutes to propagate

**Checking container logs**
```bash
docker logs montana-trackmania-bot --tail 100
```

---

## Known Limitations

- Zone leaderboards are capped at **5 players per zone** (Nadeo API limit — cannot be increased).
- Weekly Shorts week numbering is derived by parsing the campaign name (e.g. `Week 71`). If Nadeo changes the naming format, the week offset calculation falls back to a date-based estimate.

---

## Dependencies

| Package | Purpose |
|---|---|
| `discord.js` | Discord API client |
| `@discordjs/builders` | Slash command builder |
| `@discordjs/rest` | REST client for command deployment |
| `trackmania-api-node` | Nadeo API helpers (map records, leaderboards) |
| `node-fetch` | HTTP requests to Nadeo/Trackmania APIs |
| `dotenv` | Environment variable loading |

---

## License

MIT

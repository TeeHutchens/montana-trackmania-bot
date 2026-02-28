# Montana Trackmania Discord Bot

## Project Purpose
Discord bot for the Montana Trackmania community. Serves leaderboard data for Weekly Shorts campaigns and the current seasonal campaign, filtered to Montana-zone players only.

## Active Commands
| Command | Function | Description |
|---|---|---|
| `/weeklyshorts scores` | `getMontanaSpecificScores()` | Montana SP leaderboard for current Weekly Shorts |
| `/weeklyshorts maps` | `getWeeklyShorts()` | Per-track top-5 Montana times for current week |
| `/weeklyshorts track <week> <track>` | `getMontanaWeeklyTrack()` | Montana times for a specific week/track combo |
| `/campaign scores` | `getMontanaCampaignScores()` | Montana SP leaderboard for current seasonal campaign |
| `/campaign track <track>` | `getMontanaCampaignTrack()` | Montana times for a specific seasonal campaign track |

## Authentication Flow
Three-level Nadeo auth via `functions/authentication.js`:
1. Ubisoft login (`UBI_USERNAME` / `UBI_PASSWORD`) → ticket
2. `loginTrackmaniaUbi(ticket)` → NadeoServices token (`APICredentials[1]`)
3. `loginTrackmaniaNadeo(accessToken, 'NadeoLiveServices')` → NadeoLiveServices token (`APICredentials[2]`)
- `APICredentials[3]` = raw `accessToken` string from level 2

**Player display names**: `api.trackmania.com` OAuth2 `client_credentials` flow using `APP_IDENTIFIER` / `APP_SECRET`. Token is cached in-process with auto-refresh. Batch endpoint: `GET https://api.trackmania.com/api/display-names?accountId[]=...`

## Key API Patterns
- **Campaign leaderboard** (Montana SP scores): `GET https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/{seasonUid}/top?length=100&onlyWorld=false`
  - Use `campaign.seasonUid` (UUID) — NOT `campaign.id` (numeric) or `campaign.uid` (undefined)
  - Returns zones: World → North America → United States → Montana, each capped at 5 players
- **Weekly Shorts**: `GET /api/campaign/weekly-shorts?offset=0&length=1`
- **Seasonal campaign**: `GET /api/campaign/official?offset=0&length=1`
- **Map info**: `GET /api/token/map/{mapUid}`

## File Structure
```
commands/
  weeklyshorts.js     — /weeklyshorts subcommands
  campaigns.js        — /campaign subcommands
functions/
  functions.js        — all API logic and data fetching
  authentication.js   — Nadeo 3-level auth with DNS retry
helper/
  helper.js           — Discord embed formatters (scoreFormatter, embedScoresFormatter, etc.)
cache/
  PlayerCache.js      — player name cache (player_cache.json, 30-day TTL)
  MapCache.js         — map info cache (map_cache.json, 45-min TTL)
  APICache.js         — API response cache (api_cache.json, configurable TTL)
constants.js          — BOT_CONFIG.USER_AGENT
```

## Required .env Keys
```
DISCORD_TOKEN=        # Discord bot token
CLIENT_ID=            # Discord application ID
GUILD_ID=             # Discord server ID
UBI_USERNAME=         # Ubisoft account email
UBI_PASSWORD=         # Ubisoft account password
APP_IDENTIFIER=       # api.trackmania.com OAuth2 client ID
APP_SECRET=           # api.trackmania.com OAuth2 client secret
ALLOWED_COMMANDS=weeklyshorts,campaign
```

## Running Locally
```bash
cd /home/thutchens/trackmania/montana-trackmania-bot
node test-weeklyshorts-scores.js   # test /weeklyshorts scores
node test-verify-scores.js         # verify campaign SP vs in-game
```

## Deployment
Runs in Docker. Cache files are owned by the `tee` user inside the container — use `sudo` to edit them from the host when needed.

## Known Limitations
- Nadeo zone leaderboard caps at 5 players per zone (API limitation, cannot be increased)
- TMIO (`trackmania.io`) is still used for TOTD map metadata only — not for player names
- Cache permission errors (`EACCES`) are non-fatal when running tests outside Docker

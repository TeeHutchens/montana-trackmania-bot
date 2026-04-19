const { getTopPlayersMap, getMaps, getMapRecords } = require('trackmania-api-node')
const { APILogin } = require("../functions/authentication.js")
const { embedFormatter, montanaEmbedFormatter, recordPlacingFormatter, scoreFormatter } = require("../helper/helper.js")
const { BOT_CONFIG } = require('../constants.js')
const fetch = require('node-fetch')
const PlayerCache = require('../cache/PlayerCache.js')
const MapCache = require('../cache/MapCache.js')
const APICache = require('../cache/APICache.js')
require('dotenv').config()

// ── api.trackmania.com OAuth2 token (client_credentials) ────────────────────
let _tmApiToken = null;
let _tmApiTokenExpiry = 0;

async function getTMApiToken() {
    if (_tmApiToken && Date.now() < _tmApiTokenExpiry) {
        return _tmApiToken;
    }
    const clientId = process.env.APP_IDENTIFIER;
    const clientSecret = process.env.APP_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('APP_IDENTIFIER and APP_SECRET must be set in .env');
    }
    const response = await fetch('https://api.trackmania.com/api/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': BOT_CONFIG.USER_AGENT
        },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`TM API token request failed: ${response.status} ${body}`);
    }
    const data = await response.json();
    _tmApiToken = data.access_token;
    _tmApiTokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh 60s early
    console.log('✅ TM API (api.trackmania.com) token obtained');
    return _tmApiToken;
}

// Batch-lookup display names from api.trackmania.com (up to 50 IDs per call)
// Returns { accountId: displayName, ... }
async function getDisplayNames(accountIds) {
    if (!accountIds || accountIds.length === 0) return {};
    const token = await getTMApiToken();
    const params = accountIds.map(id => `accountId[]=${encodeURIComponent(id)}`).join('&');
    const response = await fetch(`https://api.trackmania.com/api/display-names?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': BOT_CONFIG.USER_AGENT
        }
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`display-names API returned ${response.status} ${body}`);
    }
    return await response.json(); // { "accountId": "displayName", ... }
}

// Initialize caches
const playerCache = new PlayerCache();
const mapCache = new MapCache();
const apiCache = new APICache();

// Function to clean track names by removing color codes
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'

    let cleaned = name

    // Trackmania encodes colored letters in a specific way:
    // - $o is a reset code (ignore)
    // - $XXXy means color XXX + letter y 
    // - $FFFword means color FFF + word "word"

    // Strategy: Process each $ code individually
    cleaned = cleaned.replace(/\$[0-9A-Za-z]+/g, (match) => {
        // Skip reset codes
        if (match === '$o') return '';

        // Check if it's a 3-digit hex code + single letter
        if (/^\$[0-9A-Fa-f]{3}[A-Za-z]$/.test(match)) {
            return match.slice(-1); // Return the letter
        }

        // Check if it's a 4-character code ending with a letter
        if (/^\$[0-9a-zA-Z]{3}[A-Za-z]$/.test(match)) {
            return match.slice(-1); // Return the letter
        }

        // Check if it's $o + letter (like $oM)
        if (/^\$o[A-Za-z]$/.test(match)) {
            return match.slice(-1); // Return the letter
        }

        // If it's longer, it might be a color code + word (like $FFFDriveby)
        if (match.length > 4) {
            // Look for pattern: $XXX + word where XXX is 3 hex digits
            const hexMatch = match.match(/^\$([0-9A-Fa-f]{3})(.+)$/);
            if (hexMatch) {
                return hexMatch[2]; // Return the word part
            }
        }

        // Default: remove the code
        return '';
    });

    // Clean up multiple spaces and normalize spacing around dashes
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()

    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }

    return cleaned
}

// Function to get multiple player names with caching
async function getCachedPlayerNames(accountIds) {
    const { cached, missing } = playerCache.getMultiplePlayerNames(accountIds);

    console.log(`📦 Found ${Object.keys(cached).length} cached player names, need to fetch ${missing.length}`);

    // If we have all names cached, return them
    if (missing.length === 0) {
        return cached;
    }

    // Fetch missing player names
    const newPlayerNames = {};

    try {
        if (missing.length > 0) {
            console.log(`🔍 Fetching ${missing.length} missing player names from api.trackmania.com...`);

            const nameData = await getDisplayNames(missing);
            for (const [accountId, displayName] of Object.entries(nameData)) {
                newPlayerNames[accountId] = displayName;
                console.log(`✅ Got player name: ${accountId} -> ${displayName}`);
            }

            // Cache only the names successfully fetched (before adding fallbacks)
            if (Object.keys(newPlayerNames).length > 0) {
                playerCache.setMultiplePlayerNames(newPlayerNames);
                console.log(`💾 Cached ${Object.keys(newPlayerNames).length} new player names`);
            }

            // For any not returned by the API, use a fallback (not cached, retried next run)
            for (const accountId of missing) {
                if (!newPlayerNames[accountId]) {
                    newPlayerNames[accountId] = `Player_${accountId.substring(0, 8)}`;
                    console.log(`⚠️ Using fallback name for ${accountId} (not cached, will retry)`);
                }
            }
        }
    } catch (error) {
        console.log('Error fetching missing player names:', error.message);

        for (const accountId of missing) {
            if (!newPlayerNames[accountId]) {
                newPlayerNames[accountId] = `Player_${accountId.substring(0, 8)}`;
            }
        }
    }

    // Combine cached and newly fetched names
    return { ...cached, ...newPlayerNames };
}
async function getAuthorName(authorAccountId) {
    if (!authorAccountId || authorAccountId === 'unknown') {
        return 'Unknown Author'
    }

    // Check cache first
    const cachedName = playerCache.getPlayerName(authorAccountId);
    if (cachedName) {
        console.log(`📦 Using cached author name for ${authorAccountId}: ${cachedName}`);
        return cachedName;
    }

    try {
        console.log(`🔍 Fetching author name for ${authorAccountId}...`);
        const nameData = await getDisplayNames([authorAccountId]);
        const authorName = nameData[authorAccountId];

        if (authorName) {
            playerCache.setPlayerName(authorAccountId, authorName);
            playerCache.saveCache();
            console.log(`💾 Cached author name: ${authorAccountId} → ${authorName}`);
            return authorName;
        }
    } catch (error) {
        console.log(`Could not get author name for ${authorAccountId}:`, error.message)
    }

    return 'Unknown Author'
}

// Cached map information fetching function
async function getCachedMapInfo(mapUid, apiCredentials) {
    // Check cache first
    const cachedMapData = mapCache.getMapData(mapUid);
    if (cachedMapData) {
        console.log(`🗺️ Using cached map info for ${mapUid}: ${cachedMapData.name} by ${cachedMapData.authorName}`);
        return cachedMapData;
    }

    console.log(`🔍 Fetching map info for ${mapUid}...`);

    // Default values
    let mapData = {
        name: `Map ${mapUid.substring(0, 8)}...`,
        author: 'unknown',
        authorName: 'Unknown Author'
    };

    try {
        // Fetch map information from Nadeo API
        const mapResponse = await fetch(`https://live-services.trackmania.nadeo.live/api/token/map/${mapUid}`, {
            headers: {
                'Authorization': `nadeo_v1 t=${apiCredentials[2].accessToken}`,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        });

        if (mapResponse.ok) {
            const rawMapData = await mapResponse.json();

            // Clean the track name to remove hex color codes
            const cleanedName = cleanTrackName(rawMapData.name);

            mapData.name = cleanedName || mapData.name;
            mapData.author = rawMapData.author || mapData.author;

            // Get the actual author name if we have a valid author ID
            if (mapData.author !== 'unknown') {
                mapData.authorName = await getAuthorName(mapData.author);
            }

            console.log(`💾 Caching map info: ${mapData.name} by ${mapData.authorName} (${mapData.author})`);

            // Cache the result for 45 minutes
            mapCache.setMapData(mapUid, mapData);

            return mapData;
        } else {
            console.log(`Map API returned ${mapResponse.status} for ${mapUid}`);
        }
    } catch (error) {
        console.log(`Could not get map info for ${mapUid}:`, error.message);
    }

    return mapData;
}

async function getTopPlayerTimes(mapUid, APICredentials = null) {
    try {
        // Only authenticate if credentials weren't provided
        if (!APICredentials) {
            console.log(`Getting API credentials...`)
            APICredentials = await APILogin()
        }

        console.log(`Getting top players for map: ${mapUid}`)
        const topPlayersResult = await getTopPlayersMap(APICredentials[3], mapUid)

        // Get the top players list (usually at index 0 for World rankings)
        let playerList = null
        if (topPlayersResult && topPlayersResult.tops && topPlayersResult.tops[0] && topPlayersResult.tops[0].top) {
            playerList = topPlayersResult.tops[0].top
            console.log(`Found ${playerList.length} players in World rankings`)
        } else {
            console.log('Could not find player rankings in expected structure')
        }

        if (!playerList || playerList.length === 0) {
            console.log('No players found for this map')
            return 'No records found for this track.'
        }

        const accountIds = []
        for (const i in playerList) {
            accountIds.push(playerList[i]["accountId"])
        }

        console.log(`Getting profiles for ${accountIds.length} players...`)

        // Use cached player names
        const playerNames = await getCachedPlayerNames(accountIds);

        const regularMapInfo = await getMaps(APICredentials[1].accessToken, [mapUid])
        const regularMapId = regularMapInfo[0]['mapId']

        console.log(`Getting detailed profiles and records...`)
        const playerTimeMap = new Map()

        // Get records for each player
        for (const accountId of accountIds) {
            try {
                const playerName = playerNames[accountId];
                if (!playerName) continue;

                const record = await getMapRecords(APICredentials[1].accessToken, accountId, regularMapId);
                if (record && record.length > 0) {
                    const time = record[0]['recordScore']['time'];
                    playerTimeMap.set(playerName, time);
                }
            } catch (recordError) {
                console.log(`Error getting record for player ${accountId}:`, recordError.message);
                continue;
            }
        }

        if (playerTimeMap.size === 0) {
            return 'No valid records found for this track.'
        }

        const playerTimeMapSort = new Map([...playerTimeMap.entries()].sort((a, b) => a[1] - b[1])); // Re-orders players' records from best to worst
        console.log(playerTimeMapSort)
        return recordPlacingFormatter(playerTimeMapSort)
    } catch (error) {
        console.error('Error in getTopPlayerTimes:', error.message)
        console.error('Stack trace:', error.stack)
        return 'Error fetching player times for this track.'
    }
}

async function getMontanaTopPlayerTimes(mapUid, APICredentials = null) {
    try {
        console.log(`🏔️ Getting Montana players for map: ${mapUid}`)

        // Only authenticate if credentials weren't provided
        if (!APICredentials) {
            APICredentials = await APILogin()
        }

        const montanaZoneId = '3022e37a-7e13-11e8-8060-e284abfd2bc4';

        // Use the zone leaderboard API to get Montana-specific rankings
        const leaderboardUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${mapUid}/top?length=100&offset=0`;
        const headers = {
            'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': BOT_CONFIG.USER_AGENT
        };

        console.log(`Getting zone-based leaderboard data...`)
        const response = await fetch(leaderboardUrl, { headers });

        if (!response.ok) {
            console.log(`❌ Zone leaderboard API failed: ${response.status}`)
            console.log('Falling back to world rankings...')
            return await getTopPlayerTimes(mapUid)
        }

        const data = await response.json();
        console.log(`✅ Got zone leaderboard with ${data.tops?.length || 0} zones`)

        // Find Montana zone in the response
        const montanaZone = data.tops?.find(zone =>
            zone.zoneName === 'Montana' || zone.zoneId === montanaZoneId
        );

        if (!montanaZone || !montanaZone.top || montanaZone.top.length === 0) {
            console.log(`❌ No Montana players found in zone leaderboard, falling back to world rankings`)
            return await getTopPlayerTimes(mapUid)
        }

        console.log(`🎯 Found ${montanaZone.top.length} Montana players!`)

        // Get map info for record processing
        const montanaMapInfo = await getMaps(APICredentials[1].accessToken, [mapUid])
        const montanaMapId = montanaMapInfo[0]['mapId']

        // Process Montana players
        const montanaPlayers = montanaZone.top;
        const accountIds = montanaPlayers.map(player => player.accountId);

        console.log(`Getting profiles for ${accountIds.length} Montana players...`)

        // Use cached player names
        const playerNames = await getCachedPlayerNames(accountIds);

        console.log(`Getting detailed Montana player profiles and records...`)
        const playerTimeMap = new Map()

        // Get records for each Montana player
        for (const accountId of accountIds) {
            try {
                const playerName = playerNames[accountId];
                if (!playerName) continue;

                const record = await getMapRecords(APICredentials[1].accessToken, accountId, montanaMapId);
                if (record && record.length > 0) {
                    const time = record[0]['recordScore']['time'];
                    playerTimeMap.set(playerName, time);
                }
            } catch (recordError) {
                console.log(`Error getting record for Montana player ${accountId}:`, recordError.message);
                continue;
            }
        }

        if (playerTimeMap.size === 0) {
            console.log('No valid Montana records found, falling back to world rankings')
            return await getTopPlayerTimes(mapUid)
        }

        const playerTimeMapSort = new Map([...playerTimeMap.entries()].sort((a, b) => a[1] - b[1])); // Re-orders players' records from best to worst
        console.log('🏔️ Montana leaderboard:', playerTimeMapSort)
        return recordPlacingFormatter(playerTimeMapSort) + '\n\n🏔️ *Montana Group Rankings*'

    } catch (error) {
        console.error('❌ Error in getMontanaTopPlayerTimes:', error.message)
        console.log('✅ Falling back to world rankings...')
        const worldResult = await getTopPlayerTimes(mapUid)
        return worldResult + '\n\n🌍 *World Rankings (Montana group unavailable)*'
    }
}

async function getWeeklyShorts() {
    const results = []
    try {
        console.log('Getting Weekly Shorts from OpenPlanet/Nadeo API...')

        // Get API credentials for Nadeo services
        let APICredentials;
        try {
            APICredentials = await APILogin();
        } catch (authError) {
            console.error('❌ Authentication failed for getWeeklyShorts:', authError.message);
            results.push({
                title: '❌ Authentication Error',
                description: `Unable to authenticate with Trackmania servers.

**Error:** ${authError.message}

**Possible causes:**
- Trackmania authentication servers are temporarily down
- Network connectivity issues
- Service maintenance

**Alternative:** Check Weekly Shorts manually at: https://trackmania.io/#/campaigns/weekly

Please try again later!`,
                color: 0xff0000,
                footer: { text: 'Authentication error - this is usually temporary' }
            });
            return results;
        }

        // Fetch weekly shorts data from the working OpenPlanet API
        console.log('Fetching weekly shorts campaign data...')
        const response = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        })

        if (!response.ok) {
            throw new Error(`Weekly shorts API returned ${response.status}: ${await response.text()}`)
        }

        const weeklyData = await response.json()
        console.log(`Received ${weeklyData.campaignList.length} weekly campaigns`)

        if (!weeklyData.campaignList || weeklyData.campaignList.length === 0) {
            throw new Error('No weekly campaigns found in API response')
        }

        // Get the latest weekly campaign
        const latestCampaign = weeklyData.campaignList[0]
        console.log(`Processing campaign: ${latestCampaign.name} with ${latestCampaign.playlist.length} tracks`)
        console.log(`Campaign object keys:`, Object.keys(latestCampaign))
        console.log(`Campaign ID:`, latestCampaign.id || latestCampaign.seasonUid || latestCampaign.uid || 'Not found')

        // Process up to 5 tracks from the campaign
        const tracksToProcess = Math.min(5, latestCampaign.playlist.length)

        for (let i = 0; i < tracksToProcess; i++) {
            try {
                const playlistItem = latestCampaign.playlist[i]
                const mapUid = playlistItem.mapUid

                console.log(`Processing track ${i + 1}: ${mapUid}`)

                // Get cached map information (includes track name and author)
                const mapInfo = await getCachedMapInfo(mapUid, APICredentials);
                const trackName = mapInfo.name;
                const authorName = mapInfo.authorName;
                const authorAccountId = mapInfo.author;

                console.log(`Using map info: ${trackName} by ${authorName} (${authorAccountId})`);

                // Get top player times for this track (attempt Montana first, fallback to World)
                console.log(`Getting top times for track: ${trackName}`)
                const topTimesResult = await getMontanaTopPlayerTimes(mapUid, APICredentials)

                // Choose the appropriate formatter based on ranking scope
                const isMontanaRanking = topTimesResult.includes('Montana Group')
                let embed

                if (isMontanaRanking) {
                    // Use Montana-specific formatting - clean up the suffix
                    const cleanResult = topTimesResult.replace(/\n\n🏔️ \*Montana Group Rankings\*$/, '')
                    embed = montanaEmbedFormatter(trackName, mapUid, cleanResult, authorName, authorAccountId)
                } else {
                    // Use regular formatting for world rankings - clean up the suffix
                    const cleanResult = topTimesResult.replace(/\n\n🌍 \*World Rankings \(Montana group unavailable\)\*$/, '')
                    const modifiedTrackName = trackName + ' (World Rankings)'
                    embed = embedFormatter(modifiedTrackName, mapUid, cleanResult, authorName, authorAccountId)
                }

                results.push(embed)
                console.log(`Successfully processed track ${i + 1}: ${trackName}`)

            } catch (trackError) {
                console.error(`Error processing track ${i + 1}:`, trackError.message)
                continue
            }
        }

        if (results.length === 0) {
            throw new Error('No tracks were successfully processed')
        }

        console.log(`Successfully processed ${results.length} weekly shorts tracks`)

    } catch (error) {
        console.error('Error in getWeeklyShorts:', error.message)

        // Provide a user-friendly error message
        results.push({
            title: '❌ Weekly Shorts Error',
            description: `Unable to fetch Weekly Shorts data from the API.

**Error:** ${error.message}

**Possible causes:**
- Trackmania Live Services API is temporarily down
- Authentication issues
- Network connectivity problems

**Alternative:** Check Weekly Shorts manually at: https://trackmania.io/#/campaigns/weekly

Please try again later!`,
            color: 0xff0000,
            footer: { text: 'OpenPlanet/Nadeo API error' }
        })
    }
    return results
}

// Function to get Montana-specific scores using the game API
async function getMontanaSpecificScores(montanaGroupId = null) {
    try {
        console.log('🏔️ Fetching fresh Montana-specific scores from game API...');

        let APICredentials;
        try {
            APICredentials = await APILogin();
        } catch (authError) {
            console.error('❌ Authentication failed:', authError.message);
            return {
                success: false,
                error: 'Authentication failed',
                fallbackMessage: `❌ **Trackmania API Authentication Failed**

**Error:** ${authError.message}

**Possible causes:**
- Trackmania authentication servers are temporarily down
- Network connectivity issues
- Service maintenance

**What you can do:**
- Try again in a few minutes
- Check [Trackmania Status](https://live-services.trackmania.nadeo.live) for service updates
- Use alternative commands like \`/weeklyshorts maps\`

This is a temporary issue with Trackmania's authentication service.`
            };
        }

        // If no group ID provided, we need to find the correct Weekly Shorts leaderboard group ID
        if (!montanaGroupId) {
            console.log('🔍 No group ID provided, fetching current Weekly Shorts seasonUid...');
            
            // First get the current Weekly Shorts campaign
            const currentWeekResponse = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
                headers: {
                    'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                    'User-Agent': BOT_CONFIG.USER_AGENT
                }
            });
            
            if (!currentWeekResponse.ok) {
                throw new Error(`Failed to fetch current weekly shorts: ${currentWeekResponse.status}`);
            }
            
            const currentWeekData = await currentWeekResponse.json();
            
            if (!currentWeekData.campaignList || currentWeekData.campaignList.length === 0) {
                throw new Error('No weekly campaigns found in API response');
            }
            
            const currentCampaign = currentWeekData.campaignList[0];
            console.log(`🎯 Found Weekly Shorts campaign: ${currentCampaign.name} (Week ${currentCampaign.week})`);
            
            // Use seasonUid as the leaderboard group ID
            montanaGroupId = currentCampaign.seasonUid;
            
            if (!montanaGroupId) {
                throw new Error('seasonUid not found in Weekly Shorts campaign data');
            }
            
            console.log(`🎯 Using Weekly Shorts seasonUid as group ID: ${montanaGroupId}`);
        }

        // If a specific group ID was provided, use the original logic
        // Check if we have cached API response
        const cacheKey = `montana_scores_${montanaGroupId}`;
        const cachedResponse = await apiCache.getAPIResponse(cacheKey);

        if (cachedResponse) {
            console.log('🗄️ Using cached Montana leaderboard response');
            return cachedResponse;
        }

        const nadeoToken = APICredentials[3];

        const response = await fetch(`https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${montanaGroupId}/top`, {
            headers: {
                'Authorization': 'nadeo_v1 t=' + nadeoToken,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Find Montana zone in the response
        const montanaZone = data.tops?.find(zone =>
            zone.zoneName && zone.zoneName.toLowerCase().includes('montana')
        );

        if (!montanaZone) {
            console.log('❌ No Montana zone found in API response');
            return {
                success: false,
                error: 'Montana zone not found in leaderboard data',
                fallbackMessage: 'Unable to fetch Montana-specific scores. Montana zone not found in the current Weekly Shorts campaign.'
            };
        }

        console.log('✅ Found Montana zone with', montanaZone.top.length, 'players');

        // Format the data for the embed
        const formattedData = {
            users: montanaZone.top.map(player => ({
                nameOnPlatform: 'Loading...', // We'll need to fetch player names
                sp: parseInt(player.sp),
                position: player.position
            }))
        };

        // Get player names for the account IDs
        const accountIds = montanaZone.top.map(player => player.accountId);
        const playerNames = await getCachedPlayerNames(accountIds);

        // Update the formatted data with actual player names
        formattedData.users.forEach((user, index) => {
            const accountId = montanaZone.top[index].accountId;
            user.nameOnPlatform = playerNames[accountId] || 'Unknown Player';
        });

        const result = {
            success: true,
            data: formattedData,
            campaignName: 'Weekly Shorts'
        };

        // Cache the response for 45 minutes
        await apiCache.setAPIResponse(cacheKey, result);
        console.log('💾 Cached Montana leaderboard response for 45 minutes');

        return result;

    } catch (error) {
        console.error('❌ Error fetching Montana-specific scores:', error);
        return {
            success: false,
            error: error.message,
            fallbackMessage: `Unable to fetch Montana-specific scores: ${error.message}`
        };
    }
}

// Function to get Montana records for a specific weekly shorts track by week and track number
async function getMontanaWeeklyTrack(weekNumber, trackNumber) {
    try {
        console.log(`🏔️ Getting Montana records for Week ${weekNumber}, Track ${trackNumber}`);

        // Get API credentials
        const APICredentials = await APILogin();

        // Check cache first
        const cacheKey = `montana_weekly_track_${weekNumber}_${trackNumber}`;
        const cachedResponse = await apiCache.getAPIResponse(cacheKey);

        if (cachedResponse) {
            console.log('🗄️ Using cached weekly track response');
            return cachedResponse;
        }

        // Calculate offset for chronological week numbering
        // Week 1 = oldest, current week = highest number
        // Get the current week dynamically from the Weekly Shorts API
        let currentWeek;
        
        // First, get the current weekly shorts to determine what week we're on
        const currentWeekResponse = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        });
        
        if (currentWeekResponse.ok) {
            const currentWeekData = await currentWeekResponse.json();
            
            // Try to determine current week from the campaign name or other identifiers
            if (currentWeekData.campaignList && currentWeekData.campaignList.length > 0) {
                const currentCampaign = currentWeekData.campaignList[0];
                
                // Try to extract week number from campaign name (e.g., "Weekly Shorts #34")
                const weekMatch = currentCampaign.name?.match(/Weekly Shorts #(\d+)/i) || 
                                 currentCampaign.name?.match(/#(\d+)/) ||
                                 currentCampaign.name?.match(/Week (\d+)/i);
                
                if (weekMatch) {
                    currentWeek = parseInt(weekMatch[1]);
                    console.log(`📅 Detected current week from campaign name: ${currentWeek}`);
                } else {
                    // Fallback: calculate based on date if no week number in name
                    // Weekly Shorts started sometime in 2024, estimate based on weeks since then
                    const now = new Date();
                    const weeklyStartDate = new Date('2024-01-07'); // Adjust this to actual start date
                    const daysSinceStart = Math.floor((now - weeklyStartDate) / (1000 * 60 * 60 * 24));
                    currentWeek = Math.floor(daysSinceStart / 7) + 1;
                    
                    console.log(`📅 Calculated current week from date: ${currentWeek} (estimated)`);
                }
            } else {
                throw new Error('Unable to determine current week from Weekly Shorts API');
            }
        } else {
            throw new Error(`Failed to fetch current weekly shorts: ${currentWeekResponse.status}`);
        }
        
        const offset = currentWeek - weekNumber;
        
        if (offset < 0) {
            throw new Error(`Week ${weekNumber} is in the future. Current week is ${currentWeek}.`);
        }

        console.log(`📅 Calculating offset: current week ${currentWeek} - requested week ${weekNumber} = offset ${offset}`);

        // Fetch historical weekly shorts data
        const response = await fetch(`https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=${offset}&length=1`, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Weekly shorts API returned ${response.status}: ${await response.text()}`);
        }

        const weeklyData = await response.json();

        if (!weeklyData.campaignList || weeklyData.campaignList.length === 0) {
            throw new Error(`Week ${weekNumber} not found`);
        }

        const campaign = weeklyData.campaignList[0];

        if (!campaign.playlist || campaign.playlist.length < trackNumber || trackNumber < 1) {
            throw new Error(`Track ${trackNumber} not found in Week ${weekNumber}. Week has ${campaign.playlist?.length || 0} tracks.`);
        }

        const track = campaign.playlist[trackNumber - 1];
        const mapUid = track.mapUid;

        console.log(`Found track: ${mapUid} for Week ${weekNumber}, Track ${trackNumber}`);

        // Get map information
        const mapInfo = await getCachedMapInfo(mapUid, APICredentials);
        const trackName = mapInfo.name;
        const authorName = mapInfo.authorName;

        // Get Montana top player times for this specific track
        const montanaResult = await getMontanaTopPlayerTimes(mapUid, APICredentials);

        // Check if we got Montana-specific results
        const isMontanaRanking = montanaResult.includes('Montana Group');

        let embed;
        if (isMontanaRanking) {
            // Clean up the Montana result and format it
            const cleanResult = montanaResult.replace(/\n\n🏔️ \*Montana Group Rankings\*$/, '');
            embed = montanaEmbedFormatter(trackName, mapUid, cleanResult, authorName, mapInfo.author);
            embed.setTitle(`🏔️ Week ${weekNumber} Track ${trackNumber} - Montana Records`);
            embed.setDescription(`**${trackName}** by ${authorName}\nMontana players ranked by completion time`);
        } else {
            // No Montana players found, show world rankings
            const cleanResult = montanaResult.replace(/\n\n🌍 \*World Rankings \(Montana group unavailable\)\*$/, '');
            embed = embedFormatter(`${trackName} (World Rankings)`, mapUid, cleanResult, authorName, mapInfo.author);
            embed.setTitle(`🌍 Week ${weekNumber} Track ${trackNumber} - World Records`);
            embed.setDescription(`**${trackName}** by ${authorName}\nNo Montana players found - showing world rankings`);
        }

        // Add week and track info to footer
        const currentFooterText = embed.data?.footer?.text || 'Weekly Shorts';
        embed.setFooter({
            text: `Week ${weekNumber} • Track ${trackNumber} • ${currentFooterText}`
        });

        const result = {
            success: true,
            embed: embed,
            campaignName: campaign.name,
            weekNumber: weekNumber,
            trackNumber: trackNumber,
            trackName: trackName,
            authorName: authorName
        };

        // Cache the response for 45 minutes
        await apiCache.setAPIResponse(cacheKey, result);
        console.log(`💾 Cached Weekly Track W${weekNumber}T${trackNumber} response for 45 minutes`);

        return result;

    } catch (error) {
        console.error(`❌ Error fetching Week ${weekNumber} Track ${trackNumber}:`, error);
        return {
            success: false,
            error: error.message,
            fallbackMessage: `Unable to fetch records for Week ${weekNumber}, Track ${trackNumber}: ${error.message}`
        };
    }
}

async function getMontanaCampaignTrack(trackNumber) {
    try {
        console.log(`🏔️ Getting Montana records for Current Campaign Track ${trackNumber}`);

        // Get API credentials
        const APICredentials = await APILogin();

        // Check cache first
        const cacheKey = `montana_campaign_track_${trackNumber}`;
        const cachedResponse = await apiCache.getAPIResponse(cacheKey);

        if (cachedResponse) {
            console.log('🗄️ Using cached campaign track response');
            return cachedResponse;
        }

        // Fetch current seasonal campaign data
        console.log('🗓️ Fetching current seasonal campaign data...');
        const response = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/official?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Campaign API returned ${response.status}: ${await response.text()}`);
        }

        const campaignData = await response.json();

        if (!campaignData.campaignList || campaignData.campaignList.length === 0) {
            throw new Error('No seasonal campaigns found');
        }

        const campaign = campaignData.campaignList[0];

        if (!campaign.playlist || campaign.playlist.length < trackNumber || trackNumber < 1) {
            throw new Error(`Track ${trackNumber} not found in current campaign. Campaign has ${campaign.playlist?.length || 0} tracks.`);
        }

        const track = campaign.playlist[trackNumber - 1];
        const mapUid = track.mapUid;

        console.log(`Found track: ${mapUid} for Campaign Track ${trackNumber}`);

        // Get map information
        const mapInfo = await getCachedMapInfo(mapUid, APICredentials);
        const trackName = mapInfo.name;
        const authorName = mapInfo.authorName;

        // Get Montana top player times for this specific track
        const montanaResults = await getMontanaTopPlayerTimes(mapUid, APICredentials);

        if (!montanaResults || montanaResults.length === 0) {
            throw new Error(`No Montana players found on Campaign Track ${trackNumber}`);
        }

        // Create Montana-specific embed with campaign context
        const embed = montanaEmbedFormatter(
            trackName,
            mapUid,
            montanaResults,
            authorName,
            mapInfo.author
        );

        // Customize for campaign context
        embed.setTitle(`🏆 ${trackName} - Campaign Track ${trackNumber}`);
        embed.setDescription(`🏔️ Montana records for ${campaign.name || 'Current Campaign'} - Track ${trackNumber}`);
        const currentFooterText = embed.data?.footer?.text || 'Campaign Track';
        embed.setFooter({ text: `🏆 ${currentFooterText} | Track ${trackNumber}/25` });

        const result = {
            success: true,
            embed: embed,
            trackName: trackName,
            campaignName: campaign.name || 'Current Campaign'
        };

        // Cache the response for 45 minutes (campaigns change less frequently than weekly shorts)
        await apiCache.setAPIResponse(cacheKey, result);
        console.log(`💾 Cached Campaign Track ${trackNumber} response for 45 minutes`);

        return result;

    } catch (error) {
        console.error(`❌ Error fetching Campaign Track ${trackNumber}:`, error);
        return {
            success: false,
            error: error.message,
            fallbackMessage: `Unable to fetch records for Campaign Track ${trackNumber}: ${error.message}`
        };
    }
}

async function getMontanaCampaignScores() {
    try {
        console.log('🏔️ Getting Montana campaign scores for current seasonal campaign');

        // Get API credentials
        const APICredentials = await APILogin();

        // Check cache first
        const cacheKey = 'montana_campaign_scores';
        const cachedResponse = await apiCache.getAPIResponse(cacheKey);

        if (cachedResponse) {
            console.log('🗄️ Using cached campaign scores response');
            return cachedResponse;
        }

        // Fetch current seasonal campaign data
        console.log('🗓️ Fetching current seasonal campaign data...');
        const response = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/official?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Campaign API returned ${response.status}: ${await response.text()}`);
        }

        const campaignData = await response.json();

        if (!campaignData.campaignList || campaignData.campaignList.length === 0) {
            throw new Error('No seasonal campaigns found');
        }

        const campaign = campaignData.campaignList[0];
        const seasonUid = campaign.seasonUid;
        console.log(`Processing campaign: ${campaign.name} (seasonUid: ${seasonUid}) with ${campaign.playlist?.length || 0} tracks`);

        if (!seasonUid) {
            throw new Error('seasonUid not found in campaign data');
        }

        console.log(`🏆 Getting Montana campaign leaderboard using seasonUid: ${seasonUid}`);

        const leaderboardUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${seasonUid}/top?length=100&onlyWorld=false&offset=0`;
        const leaderboardResponse = await fetch(leaderboardUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': BOT_CONFIG.USER_AGENT
            }
        });

        if (!leaderboardResponse.ok) {
            throw new Error(`Campaign leaderboard API returned ${leaderboardResponse.status}`);
        }

        const leaderboardData = await leaderboardResponse.json();
        console.log(`✅ Got campaign leaderboard with ${leaderboardData.tops?.length || 0} zones`);

        // Find Montana zone in the campaign leaderboard
        const montanaZone = leaderboardData.tops?.find(zone =>
            zone.zoneName && zone.zoneName.toLowerCase().includes('montana')
        );

        if (!montanaZone || !montanaZone.top || montanaZone.top.length === 0) {
            console.log('❌ No Montana players found in campaign leaderboard');
            throw new Error('No Montana players found in the current campaign leaderboard');
        }

        console.log(`🏔️ Found ${montanaZone.top.length} Montana players in campaign leaderboard`);

        // Get player names for the account IDs
        const accountIds = montanaZone.top.map(player => player.accountId);
        const playerNames = await getCachedPlayerNames(accountIds);

        // Format the data for the embed (take top 5)
        const formattedData = {
            users: montanaZone.top.slice(0, 5).map((player) => ({
                nameOnPlatform: playerNames[player.accountId] || 'Unknown Player',
                sp: parseInt(player.sp),
                position: player.position
            }))
        };

        const result = {
            success: true,
            data: formattedData, // Return raw data, not formatted
            campaignName: campaign.name || 'Current Campaign',
            trackCount: campaign.playlist?.length || 0,
            groupId: seasonUid
        };

        // Cache the response for 1 hour (campaign scores change less frequently)
        await apiCache.setAPIResponse(cacheKey, result);
        console.log(`💾 Cached Montana campaign scores for 1 hour`);

        return result;

    } catch (error) {
        console.error('❌ Error fetching Montana campaign scores:', error);
        return {
            success: false,
            error: error.message,
            fallbackMessage: `Unable to fetch Montana campaign scores: ${error.message}`
        };
    }
}

module.exports = {
    getWeeklyShorts,
    getMontanaTopPlayerTimes,
    getCachedMapInfo,
    cleanTrackName,
    getMontanaSpecificScores,
    getMontanaWeeklyTrack,
    getMontanaCampaignTrack,
    getMontanaCampaignScores
};
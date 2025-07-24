const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client();
const { getTopPlayersGroup, getTopPlayersMap, getMaps, getMapRecords, getProfiles, getProfilesById } = require('trackmania-api-node')
const { APILogin } = require("../functions/authentication.js")
const { embedFormatter, montanaEmbedFormatter, recordPlacingFormatter, scoreFormatter } = require("../helper/helper.js")
const fetch = require('node-fetch')
const PlayerCache = require('../cache/PlayerCache.js')
const MapCache = require('../cache/MapCache.js')
const APICache = require('../cache/APICache.js')
require('dotenv').config()

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
async function getCachedPlayerNames(accountIds, apiCredentials) {
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
            console.log(`🔍 Fetching ${missing.length} missing player profiles...`);
            
            const profiles = await getProfiles(apiCredentials[1].accessToken, missing);
            if (profiles && profiles.length > 0) {
                const profileIds = profiles.map(p => p.uid);
                const profileIdAccountIdMap = new Map();
                
                for (const profile of profiles) {
                    profileIdAccountIdMap.set(profile.uid, profile.accountId);
                }
                
                const detailedProfiles = await getProfilesById(apiCredentials[0].ticket, profileIds);
                
                if (detailedProfiles && detailedProfiles.profiles) {
                    for (const profile of detailedProfiles.profiles) {
                        const accountId = profileIdAccountIdMap.get(profile.profileId);
                        if (accountId) {
                            const playerName = profile.nameOnPlatform || `Player_${accountId.substring(0, 8)}`;
                            newPlayerNames[accountId] = playerName;
                        }
                    }
                }
            }
            
            // Cache the new names
            if (Object.keys(newPlayerNames).length > 0) {
                playerCache.setMultiplePlayerNames(newPlayerNames);
                console.log(`💾 Cached ${Object.keys(newPlayerNames).length} new player names`);
            }
        }
    } catch (error) {
        console.log('Error fetching missing player names:', error.message);
    }
    
    // Combine cached and newly fetched names
    return { ...cached, ...newPlayerNames };
}
async function getAuthorName(authorAccountId, apiCredentials) {
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
        // Try to get author info from profiles API
        const profiles = await getProfiles(apiCredentials[1].accessToken, [authorAccountId])
        if (profiles && profiles.length > 0) {
            const profileIds = profiles.map(p => p.uid)
            const detailedProfiles = await getProfilesById(apiCredentials[0].ticket, profileIds)
            
            if (detailedProfiles && detailedProfiles.profiles && detailedProfiles.profiles.length > 0) {
                const authorProfile = detailedProfiles.profiles[0]
                const authorName = authorProfile.nameOnPlatform || 'Unknown Author'
                
                // Cache the result
                playerCache.setPlayerName(authorAccountId, authorName);
                playerCache.saveCache();
                
                console.log(`💾 Cached author name: ${authorAccountId} → ${authorName}`);
                return authorName;
            }
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
                'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
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
                mapData.authorName = await getAuthorName(mapData.author, apiCredentials);
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

TMIOclient.setUserAgent('state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats |Contact: @TeeHutchy on Discord')

async function getTopPlayerTimes(mapUid, APICredentials = null) {
    try {
        // Only authenticate if credentials weren't provided
        if (!APICredentials) {
            console.log(`Getting API credentials...`)
            APICredentials = await APILogin()
        }

        console.log(`Getting top players for map: ${mapUid}`)
        const topPlayersResult = await getTopPlayersMap(APICredentials[3], mapUid)
        
        const worldMapInfo = await getMaps(APICredentials[1].accessToken, [mapUid])
        const worldMapId = worldMapInfo[0]['mapId']
        
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
        const playerNames = await getCachedPlayerNames(accountIds, APICredentials);
        
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
            'User-Agent': 'state-trackmania-bot / montana@discord'
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
        const playerNames = await getCachedPlayerNames(accountIds, APICredentials);

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

async function getCampaignRecords(campaignObject, trackNumber) {
    let authorAccountId, trackName, trackUid, authorName = null

    trackUid = campaignObject['_data']['playlist'][trackNumber - 1].mapUid
    trackName = campaignObject['_data']['playlist'][trackNumber - 1].name
    authorAccountId = campaignObject['_data']['playlist'][trackNumber - 1].author
    if (campaignObject.mapCount < trackNumber) {
        console.log(`Campaign does not contain track #${trackNumber}`)
        return 'No Track Found'
    }

    await TMIOclient.players.get(authorAccountId).then(player => {
        authorName = player.name
    })

    const topTimesResult = await getTopPlayerTimes(trackUid)
    const replyEmbed = embedFormatter(trackName, trackUid, topTimesResult, authorName, authorAccountId)
    return replyEmbed
}

async function getTotdRecords(date) {
    let trackName, totdSearch, totdauthor, authorAccountId, trackUid = null
    await TMIOclient.totd.get(date).then(async totd => {
        trackUid = totd.map().id
        totdSearch = await totd.map().then(async map => {
            trackUid = map.uid
            trackName = map.fileName.replace(/\.[^/.]+$/, "").replace(/\.[^/.]+$/, "")
            await map.author().then(async author => {
                totdauthor = author.name
                authorAccountId = author.id
            })
        })
    })
    const topTimesResult = await getTopPlayerTimes(trackUid)
    const replyEmbed = embedFormatter(trackName, trackUid, topTimesResult, totdauthor, authorAccountId)
    return replyEmbed
}

async function getWeeklyShorts() {
    const results = []
    try {
        console.log('Getting Weekly Shorts from OpenPlanet/Nadeo API...')
        
        // Get API credentials for Nadeo services
        const APICredentials = await APILogin()
        
        // Fetch weekly shorts data from the working OpenPlanet API
        console.log('Fetching weekly shorts campaign data...')
        const response = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
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

async function getTopPlayerScores(groupUId) {
    const APICredentials = await APILogin()

    try {
        const topPlayersResult = await getTopPlayersGroup(APICredentials[3], groupUId)
        const playerList = topPlayersResult['tops'][3]['top']
        const dictionary = {
            'users': []
        }
        const accountIds = []
        for (const i in playerList) {
            dictionary['users'].push({
                'accountId': playerList[i]["accountId"],
                'uid': '',
                'nameOnPlatform': '',
                'position': playerList[i]["position"],
                'sp': playerList[i]["sp"]
            })
            accountIds.push(playerList[i]["accountId"])
        }
        const playerProfiles = await getProfiles(APICredentials[1].accessToken, accountIds)
        const profileIdAccountIdMap = new Map();
        const profileIds = []
        for (const i in playerProfiles) {
            let uid = playerProfiles[i]["uid"]
            let accountId = playerProfiles[i]["accountId"]
            profileIds.push(uid)
            profileIdAccountIdMap.set(accountId, uid)
        }
        for (let i = 0; i < dictionary['users'].length; i++) {
            dictionary['users'][i]['uid'] = profileIdAccountIdMap.get(dictionary['users'][i]['accountId'])
        }
        const profiles = await getProfilesById(APICredentials[0].ticket, profileIds)
        for (const i in profiles["profiles"]) {
            let { nameOnPlatform, profileId } = profiles["profiles"][i]
            for (let i = 0; i < dictionary['users'].length; i++) {
                if (profileId == dictionary['users'][i]['uid']) {
                    dictionary['users'][i]['nameOnPlatform'] = nameOnPlatform
                    break
                }
            }
        }
        const result = scoreFormatter(dictionary)
        return result
    } catch (e) {
        console.log(e)
    }
}

async function getWeeklyShortsCampaignLeaderboard(campaignId, apiCredentials) {
    try {
        console.log(`🏆 Getting campaign leaderboard for: ${campaignId}`)
        
        const leaderboardUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${campaignId}/top?length=100&onlyWorld=false&offset=0`;
        
        const headers = {
            'Authorization': `nadeo_v1 t=${apiCredentials[2].accessToken}`,
            'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
        };
        
        console.log(`📡 Fetching campaign leaderboard data...`)
        const response = await fetch(leaderboardUrl, { headers });
        
        if (!response.ok) {
            console.log(`❌ Campaign leaderboard API failed: ${response.status}`)
            return null;
        }
        
        const data = await response.json();
        console.log(`✅ Got campaign leaderboard with ${data.tops?.length || 0} zones`)
        console.log(`🔍 Campaign leaderboard structure:`, JSON.stringify(data, null, 2))
        
        // Check if we have any zones at all
        if (!data.tops || data.tops.length === 0) {
            console.log(`❌ Campaign leaderboard returned 0 zones - API structure may be different or leaderboard not populated yet`)
            return null;
        }
        
        // Find Montana players from all zones
        const montanaPlayers = [];
        
        if (data.tops && data.tops.length > 0) {
            for (const zone of data.tops) {
                console.log(`🌍 Processing zone: ${zone.zoneName} with ${zone.top?.length || 0} players`)
                if (zone.top && Array.isArray(zone.top)) {
                    for (const player of zone.top) {
                        console.log(`👤 Player: ${player.zoneName} (position: ${player.position}, sp: ${player.sp})`)
                        // Check if player is from Montana
                        if (player.zoneName && player.zoneName.toLowerCase().includes('montana')) {
                            montanaPlayers.push({
                                accountId: player.accountId,
                                zoneName: player.zoneName,
                                position: player.position,
                                sp: parseInt(player.sp) // Score Points
                            });
                        }
                    }
                }
            }
        } else {
            console.log(`🔍 No tops array found in response. Response keys:`, Object.keys(data))
            console.log(`🔍 Full response:`, data)
        }
        
        console.log(`🏔️ Found ${montanaPlayers.length} Montana players in campaign leaderboard`)
        
        if (montanaPlayers.length === 0) {
            console.log(`❌ No Montana players found in campaign leaderboard`)
            return null;
        }
        
        // Sort by SP (Score Points) descending
        montanaPlayers.sort((a, b) => b.sp - a.sp);
        
        // Get player names for the top Montana players
        const accountIds = montanaPlayers.slice(0, 5).map(p => p.accountId);
        const profiles = await getProfilesById(apiCredentials[0].ticket, accountIds);
        
        // Create the final result in the expected format
        const dictionary = {
            'users': []
        };
        
        for (let i = 0; i < Math.min(5, montanaPlayers.length); i++) {
            const player = montanaPlayers[i];
            const profile = profiles.profiles.find(p => p.profileId === player.accountId);
            const playerName = profile ? profile.nameOnPlatform : `Unknown-${player.accountId}`;
            
            dictionary.users.push({
                nameOnPlatform: playerName,
                sp: player.sp,
                position: player.position,
                zoneName: player.zoneName
            });
        }
        
        console.log(`🏆 Montana campaign leaderboard:`, dictionary.users.map(u => `${u.nameOnPlatform}: ${u.sp} SP`));
        
        return dictionary;
        
    } catch (error) {
        console.log(`❌ Error getting campaign leaderboard:`, error.message);
        return null;
    }
}

async function getWeeklyShortsIndividualMapScoring(currentCampaign, APICredentials, campaignName) {
    console.log('🏔️ Using individual map scoring fallback method...')
    
    // Get Montana players' scores from each map and calculate totals
    const montanaPlayerScores = new Map() // playerName -> totalScore
    const processedMaps = []
    
    // Process each map in the campaign
    for (let i = 0; i < currentCampaign.playlist.length; i++) {
        try {
            const playlistItem = currentCampaign.playlist[i]
            const mapUid = playlistItem.mapUid
            
            console.log(`📍 Processing map ${i + 1}/${currentCampaign.playlist.length}: ${mapUid}`)
            
            // Get cached map information
            const mapInfo = await getCachedMapInfo(mapUid, APICredentials)
            const trackName = mapInfo.name
            processedMaps.push(trackName)
            
            console.log(`🏔️ Getting Montana players for map: ${trackName} using getMontanaTopPlayerTimes`)
            
            // Get Montana player times for this specific map
            const montanaResult = await getMontanaTopPlayerTimes(mapUid, APICredentials)
            
            if (montanaResult && typeof montanaResult === 'string') {
                // Parse the formatted result to extract player names and positions
                const lines = montanaResult.split('\n').filter(line => line.trim())
                
                lines.forEach((line, index) => {
                    // Match emoji format like ":first_place: **PlayerName** time"
                    const match = line.match(/:(?:first_place|second_place|third_place|medal):\s*\*\*(.+?)\*\*/)
                    if (match) {
                        const playerName = match[1].trim()
                        // Give points based on position: 1st = 100, 2nd = 95, 3rd = 90, 4th = 85, 5th = 80
                        const points = Math.max(0, 105 - (index + 1) * 5)
                        
                        if (montanaPlayerScores.has(playerName)) {
                            montanaPlayerScores.set(playerName, montanaPlayerScores.get(playerName) + points)
                        } else {
                            montanaPlayerScores.set(playerName, points)
                        }
                        
                        console.log(`📊 ${playerName}: +${points} points (position ${index + 1})`)
                    }
                })
                
                console.log(`✅ Processed ${trackName} - found Montana players`)
                
            } else {
                console.log(`⚠️ No Montana players found for ${trackName}`)
            }
            
        } catch (mapError) {
            console.log(`❌ Error processing map ${i + 1}:`, mapError.message)
            continue
        }
    }
    
    console.log(`📊 Final Montana player scores:`)
    montanaPlayerScores.forEach((score, playerName) => {
        console.log(`  ${playerName}: ${score} points`)
    })
    
    // Check if we found any Montana players
    if (montanaPlayerScores.size === 0) {
        throw new Error('No Montana players found in any weekly shorts maps')
    }
    
    // Sort players by total score (descending)
    const sortedPlayers = Array.from(montanaPlayerScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5
    
    console.log(`🏆 Top 5 Montana players:`)
    sortedPlayers.forEach(([playerName, totalScore], index) => {
        console.log(`  ${index + 1}. ${playerName}: ${totalScore} points`)
    })
    
    // Format the result for Discord embed
    const dictionary = {
        'users': []
    }
    
    sortedPlayers.forEach(([playerName, totalScore], index) => {
        dictionary.users.push({
            nameOnPlatform: playerName,
            sp: totalScore // Use our calculated points as "SP"
        })
    })
    
    const formattedResult = scoreFormatter(dictionary)
    
    return {
        success: true,
        data: formattedResult,
        campaignName: `${campaignName} (Individual Map Scores)`,
        playerCount: sortedPlayers.length,
        fallbackUsed: true
    }
}

async function getWeeklyShortsTopFive() {
    try {
        console.log('Getting Weekly Shorts top 5 overall scores from Nadeo API...')
        
        // Get API credentials for Nadeo services
        const APICredentials = await APILogin()
        
        // First, get the current weekly shorts campaign to get the seasonUid
        console.log('Fetching current weekly shorts campaign...')
        const campaignResponse = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
            }
        })
        
        if (!campaignResponse.ok) {
            throw new Error(`Weekly shorts campaign API returned ${campaignResponse.status}: ${await campaignResponse.text()}`)
        }
        
        const weeklyData = await campaignResponse.json()
        
        if (!weeklyData.campaignList || weeklyData.campaignList.length === 0) {
            throw new Error('No weekly campaigns found in API response')
        }
        
        const currentCampaign = weeklyData.campaignList[0]
        const campaignName = currentCampaign.name
        
        console.log(`Found campaign: ${campaignName}`)
        console.log(`Campaign object keys:`, Object.keys(currentCampaign))
        console.log(`Campaign ID:`, currentCampaign.id || currentCampaign.seasonUid || currentCampaign.uid || 'Not found')
        
        // Try to get the campaign ID (groupUid) for the leaderboard API
        const campaignId = currentCampaign.id || currentCampaign.seasonUid || currentCampaign.uid;
        
        if (!campaignId) {
            console.log('❌ Could not find campaign ID, falling back to individual map scores')
            throw new Error('Campaign ID not found in response')
        }
        
        console.log(`🏔️ Getting Montana players from official campaign leaderboard...`)
        
        // Get the official campaign leaderboard with actual SP scores
        const campaignResult = await getWeeklyShortsCampaignLeaderboard(campaignId, APICredentials)
        
        if (!campaignResult || !campaignResult.users || campaignResult.users.length === 0) {
            console.log('❌ Campaign leaderboard failed or returned no Montana players, falling back to individual map scoring...')
            
            // Fallback: Use the individual map approach that was working before
            return await getWeeklyShortsIndividualMapScoring(currentCampaign, APICredentials, campaignName)
        }
        
        console.log(`🏆 Found ${campaignResult.users.length} Montana players in campaign leaderboard`)
        
        // Format the result using the existing scoreFormatter
        const formattedResult = scoreFormatter(campaignResult)
        
        console.log('✅ Successfully retrieved Montana campaign leaderboard with official SP scores')
        
        return {
            success: true,
            data: formattedResult,
            campaignName: campaignName,
            playerCount: campaignResult.users.length
        }
        
    } catch (error) {
        console.log(`❌ Error in getWeeklyShortsTopFive: ${error.message}`)
        
        return {
            success: false,
            error: error.message,
            fallbackMessage: `
**Error getting Weekly Shorts leaderboard:**

**Error:** ${error.message}

**Possible causes:**
- Trackmania Live Services API is temporarily down
- Campaign leaderboard is not yet available
- Authentication issues
- Network connectivity problems

**Alternative:** Check Weekly Shorts manually at: https://trackmania.io/#/campaigns/weekly

This bot is now using the official Trackmania campaign leaderboard API to get accurate SP (Score Points) instead of custom scoring.
            `
        }
    }
}

// Function to get Montana-specific scores using the game API
async function getMontanaSpecificScores(montanaGroupId) {
    try {
        // Check if we have cached API response
        const cacheKey = `montana_scores_${montanaGroupId}`;
        const cachedResponse = await apiCache.getAPIResponse(cacheKey);
        
        if (cachedResponse) {
            console.log('🗄️ Using cached Montana leaderboard response');
            return cachedResponse;
        }

        console.log('🏔️ Fetching fresh Montana-specific scores from game API...');
        
        const APICredentials = await APILogin();
        const nadeoToken = APICredentials[3];
        
        const response = await fetch(`https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${montanaGroupId}/top`, {
            headers: {
                'Authorization': 'nadeo_v1 t=' + nadeoToken,
                'User-Agent': 'Montana Bot / thutch@itsmemudkip (Discord)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response received:', JSON.stringify(data, null, 2));
        
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
        const playerNames = await getCachedPlayerNames(accountIds, APICredentials);
        
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

module.exports = {
    getCampaignRecords,
    getTotdRecords,
    getTopPlayerScores,
    getWeeklyShorts,
    getWeeklyShortsTopFive,
    getMontanaTopPlayerTimes,
    getCachedMapInfo,
    cleanTrackName,
    getMontanaSpecificScores
};
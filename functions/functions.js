const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client();
const { getTopPlayersGroup, getTopPlayersMap, getMaps, getMapRecords, getProfiles, getProfilesById } = require('trackmania-api-node')
const { APILogin } = require("../functions/authentication.js")
const { embedFormatter, montanaEmbedFormatter, recordPlacingFormatter, scoreFormatter } = require("../helper/helper.js")
const fetch = require('node-fetch')
const PlayerCache = require('../cache/PlayerCache.js')
const MapCache = require('../cache/MapCache.js')
require('dotenv').config()

// Initialize caches
const playerCache = new PlayerCache();
const mapCache = new MapCache();

// Function to clean track names by removing color codes
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes systematically
    // Priority: Remove realistic patterns first, be conservative about edge cases
    
    // Remove valid 3-digit hex color codes (most common and safest)
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}/g, '')
    
    // Remove other 3-character codes that might be invalid but formatted like color codes
    cleaned = cleaned.replace(/\$[0-9A-Za-z]{3}/g, '')
    
    // Remove obvious single-character codes only if they're followed by whitespace or string end
    // This prevents removing parts of words
    cleaned = cleaned.replace(/\$[0-9A-Za-z](?=\s|$)/g, '')
    
    // Clean up multiple spaces but preserve existing dash formatting
    cleaned = cleaned.replace(/\s+/g, ' ')
    
    // Only add spaces around dashes if they're at the start with numbers (for "1-Name" -> "1 - Name")
    cleaned = cleaned.replace(/^(\d+)\s*-\s*/g, '$1 - ')
    
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
                'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: taylordouglashutchens@outlook.com'
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

TMIOclient.setUserAgent('state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: taylordouglashutchens@outlook.com or @TeeHutchens on Discord')

async function getTopPlayerTimes(mapUid) {
    try {
        console.log(`Getting API credentials...`)
        const APICredentials = await APILogin()

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

async function getMontanaTopPlayerTimes(mapUid) {
    try {
        console.log(`🏔️ Getting Montana players for map: ${mapUid}`)
        const APICredentials = await APILogin()
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
                'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: taylordouglashutchens@outlook.com or @TeeHutchens on Discord'
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
                const topTimesResult = await getMontanaTopPlayerTimes(mapUid)
                
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

module.exports = {
    getCampaignRecords,
    getTotdRecords,
    getTopPlayerScores,
    getWeeklyShorts,
    getMontanaTopPlayerTimes,
    getCachedMapInfo,
    cleanTrackName
};
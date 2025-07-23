const { APILogin } = require('./functions/authentication.js');
const { getTopPlayersMap } = require('trackmania-api-node');
require('dotenv').config();

async function findMontanaPlayersInWorldRankings() {
    console.log('Searching for Montana players in world rankings...');
    
    try {
        const APICredentials = await APILogin();
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30'; // Weekly shorts track
        const montanaZoneId = process.env.GROUP_UID;
        
        console.log(`Montana Zone ID: ${montanaZoneId}`);
        console.log(`Searching world rankings for map: ${testMapUid}`);
        
        // Get world rankings (should return more than just top 5)
        const topPlayersResult = await getTopPlayersMap(APICredentials[3], testMapUid);
        
        if (topPlayersResult && topPlayersResult.tops && topPlayersResult.tops[0]) {
            const worldRankings = topPlayersResult.tops[0];
            console.log(`\n${worldRankings.zoneName} rankings:`);
            console.log(`Total players in response: ${worldRankings.top.length}`);
            
            // Look for Montana players
            const montanaPlayers = worldRankings.top.filter(player => 
                player.zoneId === montanaZoneId || player.zoneName === 'Montana'
            );
            
            console.log(`\n🔍 Montana players found: ${montanaPlayers.length}`);
            
            if (montanaPlayers.length > 0) {
                console.log('\n✅ Montana players in world rankings:');
                montanaPlayers.forEach((player, index) => {
                    console.log(`${index + 1}. Position ${player.position} - Zone: ${player.zoneName} (${player.zoneId})`);
                });
            } else {
                console.log('\n❌ No Montana players found in the returned world rankings');
                console.log('This could mean:');
                console.log('- Montana players haven\'t played this track yet');
                console.log('- Montana players are ranked lower than the returned results');
                console.log('- We need to fetch more results or use a different approach');
            }
            
            // Show some sample zones to understand the data
            console.log('\n📊 Sample of zones in world rankings:');
            const uniqueZones = [...new Set(worldRankings.top.map(p => p.zoneName))];
            uniqueZones.slice(0, 10).forEach(zone => {
                const count = worldRankings.top.filter(p => p.zoneName === zone).length;
                console.log(`- ${zone}: ${count} players`);
            });
            
        } else {
            console.log('❌ Could not get world rankings data');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

findMontanaPlayersInWorldRankings();

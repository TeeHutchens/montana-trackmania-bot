const { APILogin } = require('../functions/authentication.js');
const { getTopPlayersMap } = require('trackmania-api-node');
require('dotenv').config();

async function testExtendedMontanaSearch() {
    console.log('Testing extended search for Montana players...');
    
    try {
        const APICredentials = await APILogin();
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
        
        // Check if we can get more than 5 players by using different group types or parameters
        console.log('Getting extended world leaderboard...');
        
        // Try different approaches to get more players
        const approaches = [
            { name: 'Personal_Best', groupType: 'Personal_Best' },
            { name: 'Default approach', groupType: null }
        ];
        
        for (const approach of approaches) {
            console.log(`\nTrying approach: ${approach.name}`);
            
            let topPlayersResult;
            if (approach.groupType) {
                // This might be a parameter we can use
                topPlayersResult = await getTopPlayersMap(APICredentials[3], testMapUid);
            } else {
                topPlayersResult = await getTopPlayersMap(APICredentials[3], testMapUid);
            }
            
            if (topPlayersResult && topPlayersResult.tops && topPlayersResult.tops[0]) {
                const worldTop = topPlayersResult.tops[0].top;
                console.log(`Found ${worldTop.length} players total`);
                
                const montanaPlayers = worldTop.filter(p => p.zoneId === '3022e37a-7e13-11e8-8060-e284abfd2bc4');
                console.log(`Montana players found: ${montanaPlayers.length}`);
                
                if (montanaPlayers.length > 0) {
                    console.log('Montana players:');
                    montanaPlayers.forEach(p => {
                        console.log(`  Position ${p.position}: ${p.accountId} from ${p.zoneName}`);
                    });
                } else {
                    console.log('Looking at zone distribution:');
                    const zoneCount = {};
                    worldTop.forEach(p => {
                        zoneCount[p.zoneName] = (zoneCount[p.zoneName] || 0) + 1;
                    });
                    console.log('Top zones:', Object.entries(zoneCount).slice(0, 10));
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testExtendedMontanaSearch();

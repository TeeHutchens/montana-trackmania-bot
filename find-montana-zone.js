const { APILogin } = require('./functions/authentication.js');
const { getTopPlayersMap } = require('trackmania-api-node');
require('dotenv').config();

async function findMontanaZoneId() {
    console.log('Searching for Montana zone ID...');
    
    try {
        const APICredentials = await APILogin();
        
        // Test with one of the weekly shorts tracks
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30'; // First track from our previous test
        
        console.log('Getting zone data for a test map...');
        const topPlayersResult = await getTopPlayersMap(APICredentials[3], testMapUid);
        
        if (topPlayersResult && topPlayersResult.tops) {
            console.log('\nAvailable zones:');
            topPlayersResult.tops.forEach((zone, index) => {
                console.log(`${index}: ${zone.zoneName} (ID: ${zone.zoneId})`);
                
                // Look for Montana specifically
                if (zone.zoneName.toLowerCase().includes('montana')) {
                    console.log(`🎯 FOUND MONTANA: Zone ID = ${zone.zoneId}`);
                }
            });
            
            // Also check if there are any US state zones
            console.log('\nUS-related zones:');
            topPlayersResult.tops.forEach((zone, index) => {
                if (zone.zoneName.toLowerCase().includes('united states') || 
                    zone.zoneName.toLowerCase().includes('usa') ||
                    zone.zoneName.toLowerCase().includes('america') ||
                    zone.zoneName.toLowerCase().includes('montana')) {
                    console.log(`${index}: ${zone.zoneName} (ID: ${zone.zoneId})`);
                }
            });
        }
        
    } catch (error) {
        console.error('Error finding Montana zone ID:', error.message);
    }
}

findMontanaZoneId();

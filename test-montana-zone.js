const { APILogin } = require('./functions/authentication.js');
const { getTopPlayersMap } = require('trackmania-api-node');
const fetch = require('node-fetch');
require('dotenv').config();

async function testMontanaZone() {
    console.log('Testing Montana group-based map leaderboards...');
    
    try {
        const APICredentials = await APILogin();
        const montanaGroupId = process.env.GROUP_UID; // Use the real Montana GROUP_UID
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30'; // Weekly shorts track
        
        console.log(`Testing with Montana GROUP_UID from .env...`);
        console.log(`Montana Group ID: ${montanaGroupId}`);
        console.log(`Test Map UID: ${testMapUid}`);
        
        // Try the basic endpoint first (what we were using before)
        console.log('\n--- Testing Basic Group Endpoint ---');
        const basicUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${montanaGroupId}/map/${testMapUid}`;
        console.log(`Basic URL: ${basicUrl}`);
        
        const basicResponse = await fetch(basicUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        console.log(`Basic Response status: ${basicResponse.status}`);
        if (basicResponse.ok) {
            const basicData = await basicResponse.json();
            console.log(`Basic result: ${JSON.stringify(basicData).substring(0, 200)}...`);
        }
        
        // Now try the Personal_Best group (global leaderboard) to see the structure
        console.log('\n--- Testing Personal_Best (Global) Leaderboard ---');
        const globalUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${testMapUid}/top?length=100&offset=0`;
        console.log(`Global URL: ${globalUrl}`);
        
        const globalResponse = await fetch(globalUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        console.log(`Global Response status: ${globalResponse.status}`);
        if (globalResponse.ok) {
            const globalData = await globalResponse.json();
            console.log(`✅ SUCCESS! Found ${globalData.tops?.length || 0} zone rankings`);
            
            // Find the Montana zone specifically
            const montanaZone = globalData.tops?.find(zone => 
                zone.zoneName === 'Montana' || zone.zoneId === montanaGroupId
            );
            
            if (montanaZone) {
                console.log(`\n🎯 FOUND MONTANA ZONE!`);
                console.log(`Montana Zone ID: ${montanaZone.zoneId}`);
                console.log(`Montana Players: ${montanaZone.top?.length || 0}`);
                
                if (montanaZone.top && montanaZone.top.length > 0) {
                    console.log('\n🏆 Montana Leaderboard:');
                    montanaZone.top.forEach((player, i) => {
                        console.log(`  ${i + 1}. Position ${player.position}: ${player.accountId} (Score: ${player.score}, Timestamp: ${new Date(player.timestamp * 1000).toLocaleString()})`);
                    });
                    
                    return { 
                        success: true, 
                        montanaPlayers: montanaZone.top,
                        montanaZone: montanaZone,
                        totalZones: globalData.tops.length
                    };
                } else {
                    console.log('Montana zone found but no players');
                }
            } else {
                console.log('❌ Montana zone not found in response');
                console.log('Available zones:');
                globalData.tops?.forEach((zone, i) => {
                    console.log(`  ${i + 1}. ${zone.zoneName} (${zone.zoneId}) - ${zone.top?.length || 0} players`);
                });
            }
            
            return { success: true, globalData, montanaZone };
        } else {
            const errorText = await globalResponse.text();
            console.log(`Global API Error: ${globalResponse.status} - ${errorText}`);
        }
        
        return { success: false, error: 'Global leaderboard test failed' };
        
    } catch (error) {
        console.error('❌ Test Error:', error.message);
        return { success: false, error: error.message };
    }
}

testMontanaZone().then(result => {
    if (result.success) {
        console.log('\n🎉 Montana group leaderboard API is working!');
        console.log('This can be used for Montana-specific Weekly Shorts rankings!');
    } else {
        console.log('\n💔 Montana group API test failed.');
    }
});

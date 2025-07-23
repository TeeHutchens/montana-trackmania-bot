const { APILogin } = require('./functions/authentication.js');
const fetch = require('node-fetch');
require('dotenv').config();

async function debugZoneAccess() {
    console.log('🧪 Debugging zone access with dev account...');
    
    try {
        const APICredentials = await APILogin();
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
        
        console.log('✅ Authentication successful!');
        console.log('Getting leaderboard data...');
        
        // Get zone leaderboard
        const leaderboardUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${testMapUid}/top?length=100&offset=0`;
        const response = await fetch(leaderboardUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Got leaderboard with ${data.tops?.length || 0} zones`);
        
        if (data.tops && data.tops.length > 0) {
            console.log('\n📍 Available zones with dev account:');
            data.tops.forEach((zone, i) => {
                console.log(`  ${i + 1}. ${zone.zoneName} (${zone.zoneId}) - ${zone.top?.length || 0} players`);
            });
            
            // Check if Montana is in there
            const montanaZone = data.tops.find(zone => 
                zone.zoneName === 'Montana' || zone.zoneId === '3022e37a-7e13-11e8-8060-e284abfd2bc4'
            );
            
            if (montanaZone) {
                console.log('\n🏔️ Montana zone found!');
                console.log(`Montana players: ${montanaZone.top?.length || 0}`);
            } else {
                console.log('\n❌ Montana zone not found with dev account');
                console.log('This suggests the dev account has different zone access permissions');
            }
        } else {
            console.log('❌ No zones found in response');
        }
        
        return { success: true, zones: data.tops?.length || 0 };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

debugZoneAccess().then(result => {
    if (result.success) {
        console.log(`\n🎯 Dev account has access to ${result.zones} zone(s)`);
        console.log('Compare this to the 4 zones the previous account had access to.');
    } else {
        console.log(`\n💔 Failed: ${result.error}`);
    }
});

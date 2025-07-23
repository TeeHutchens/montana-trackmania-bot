const { APILogin } = require('../functions/authentication.js');
const fetch = require('node-fetch');
require('dotenv').config();

async function testDifferentEndpoints() {
    console.log('🧪 Testing different endpoints to check Montana access...');
    
    try {
        const APICredentials = await APILogin();
        const montanaGroupId = '3022e37a-7e13-11e8-8060-e284abfd2bc4';
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
        
        console.log('✅ Authentication successful!');
        
        // Test 1: Direct Montana group endpoint
        console.log('\n📍 Test 1: Direct Montana group endpoint');
        const directUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${montanaGroupId}/map/${testMapUid}`;
        const directResponse = await fetch(directUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        console.log(`Direct Montana endpoint status: ${directResponse.status}`);
        if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log(`Direct Montana data: ${JSON.stringify(directData).substring(0, 100)}...`);
        } else {
            const errorText = await directResponse.text();
            console.log(`Direct Montana error: ${errorText.substring(0, 200)}...`);
        }
        
        // Test 2: Try a different map to see if it's map-specific
        console.log('\n📍 Test 2: Different map UID');
        const differentMapUid = 'zv8wGR5PJ2rUvqRYhm5JC5ikvD2'; // Different map
        const diffMapUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${differentMapUid}/top?length=100&offset=0`;
        const diffMapResponse = await fetch(diffMapUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        console.log(`Different map endpoint status: ${diffMapResponse.status}`);
        if (diffMapResponse.ok) {
            const diffMapData = await diffMapResponse.json();
            console.log(`Different map zones: ${diffMapData.tops?.length || 0}`);
            if (diffMapData.tops) {
                diffMapData.tops.forEach((zone, i) => {
                    console.log(`  ${i + 1}. ${zone.zoneName} - ${zone.top?.length || 0} players`);
                });
            }
        }
        
        // Test 3: Try to access account profile/zones directly
        console.log('\n📍 Test 3: Check account zones/profile');
        const profileUrl = `https://live-services.trackmania.nadeo.live/api/token/accounts/zones`;
        const profileResponse = await fetch(profileUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        console.log(`Account zones endpoint status: ${profileResponse.status}`);
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log(`Account zones: ${JSON.stringify(profileData, null, 2)}`);
        } else {
            console.log('Account zones endpoint not available or requires different auth');
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

testDifferentEndpoints().then(result => {
    console.log('\n🎯 Testing complete. If Montana access was purchased, it might take time to propagate or require a different approach.');
});

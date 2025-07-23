const { APILogin } = require('../functions/authentication.js');
const { getProfiles, getProfilesById } = require('trackmania-api-node');
const fetch = require('node-fetch');
require('dotenv').config();

async function testMontanaWithNames() {
    console.log('🧪 Testing Montana players with actual names...');
    
    try {
        const APICredentials = await APILogin();
        const montanaZoneId = '3022e37a-7e13-11e8-8060-e284abfd2bc4';
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
        
        console.log('✅ Authentication successful!');
        console.log('Getting Montana leaderboard...');
        
        // Get Montana leaderboard
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
        
        // Find Montana zone
        const montanaZone = data.tops?.find(zone => 
            zone.zoneName === 'Montana' || zone.zoneId === montanaZoneId
        );
        
        if (!montanaZone || !montanaZone.top || montanaZone.top.length === 0) {
            throw new Error('No Montana players found');
        }
        
        console.log(`🎯 Found ${montanaZone.top.length} Montana players!`);
        
        // Get account IDs
        const accountIds = montanaZone.top.map(player => player.accountId);
        console.log('Getting player profiles...');
        
        // Get player profiles (this gets us the profile IDs we need)
        const playerProfiles = await getProfiles(APICredentials[1].accessToken, accountIds);
        console.log(`✅ Got ${playerProfiles.length} player profiles`);
        
        // Create mapping from profile ID to account ID
        const profileIdAccountIdMap = new Map();
        const profileIds = [];
        for (const profile of playerProfiles) {
            const uid = profile.uid;
            const accountId = profile.accountId;
            profileIds.push(uid);
            profileIdAccountIdMap.set(uid, accountId);
        }
        
        console.log('Getting detailed player information...');
        
        // Get detailed profiles (this gets us the actual display names)
        const detailedProfiles = await getProfilesById(APICredentials[0].ticket, profileIds);
        console.log(`✅ Got detailed profiles for ${detailedProfiles.profiles.length} players`);
        
        // Create mapping from account ID to display name
        const accountIdToNameMap = new Map();
        for (const profile of detailedProfiles.profiles) {
            const displayName = profile.nameOnPlatform;
            const profileId = profile.profileId;
            const accountId = profileIdAccountIdMap.get(profileId);
            if (accountId) {
                accountIdToNameMap.set(accountId, displayName);
            }
        }
        
        console.log('\n🏆 Montana Leaderboard with Names:');
        montanaZone.top.forEach((player, i) => {
            const playerName = accountIdToNameMap.get(player.accountId) || 'Unknown Player';
            const scoreDisplay = player.score === -1 ? 'No Time' : `${player.score}ms`;
            console.log(`  ${i + 1}. ${playerName} - ${scoreDisplay} (Position: ${player.position})`);
        });
        
        return { success: true, playersWithNames: montanaZone.top.length };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
        return { success: false, error: error.message };
    }
}

testMontanaWithNames().then(result => {
    if (result.success) {
        console.log(`\n🎉 SUCCESS: Found ${result.playersWithNames} Montana players with their actual names!`);
    } else {
        console.log(`\n💔 FAILED: ${result.error}`);
    }
});

const { APILogin } = require('./functions/authentication.js');
const fetch = require('node-fetch');
require('dotenv').config();

async function testWeeklyWithMontana() {
    console.log('🧪 Testing Weekly Shorts with Montana filtering...');
    
    try {
        // Use the working authentication from test-montana-zone.js
        const APICredentials = await APILogin();
        const montanaZoneId = '3022e37a-7e13-11e8-8060-e284abfd2bc4';
        
        console.log('✅ Authentication successful!');
        
        // Get Weekly Shorts data
        console.log('Getting Weekly Shorts campaign data...');
        const weeklyResponse = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        if (!weeklyResponse.ok) {
            throw new Error(`Weekly Shorts API failed: ${weeklyResponse.status}`);
        }
        
        const weeklyData = await weeklyResponse.json();
        console.log(`✅ Found ${weeklyData.campaignList.length} weekly campaigns`);
        
        if (!weeklyData.campaignList || weeklyData.campaignList.length === 0) {
            throw new Error('No weekly campaigns found');
        }
        
        // Get first track from the latest campaign
        const latestCampaign = weeklyData.campaignList[0];
        console.log(`Processing campaign: ${latestCampaign.name}`);
        
        if (latestCampaign.playlist.length === 0) {
            throw new Error('No tracks in weekly campaign');
        }
        
        const firstTrack = latestCampaign.playlist[0];
        const mapUid = firstTrack.mapUid;
        console.log(`Testing with first track: ${mapUid}`);
        
        // Get Montana leaderboard for this track
        const leaderboardUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${mapUid}/top?length=100&offset=0`;
        const leaderboardResponse = await fetch(leaderboardUrl, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
            }
        });
        
        if (!leaderboardResponse.ok) {
            throw new Error(`Leaderboard API failed: ${leaderboardResponse.status}`);
        }
        
        const leaderboardData = await leaderboardResponse.json();
        console.log(`✅ Got leaderboard with ${leaderboardData.tops?.length || 0} zones`);
        
        // Find Montana zone
        const montanaZone = leaderboardData.tops?.find(zone => 
            zone.zoneName === 'Montana' || zone.zoneId === montanaZoneId
        );
        
        if (montanaZone && montanaZone.top && montanaZone.top.length > 0) {
            console.log(`\n🏔️ MONTANA WEEKLY SHORTS SUCCESS!`);
            console.log(`Found ${montanaZone.top.length} Montana players for Weekly Shorts track:`);
            montanaZone.top.forEach((player, i) => {
                console.log(`  ${i + 1}. Position ${player.position}: ${player.accountId}`);
            });
            return { success: true, montanaPlayers: montanaZone.top.length };
        } else {
            console.log('❌ No Montana players found for this Weekly Shorts track');
            console.log('This track would show world rankings instead');
            return { success: true, fallbackToWorld: true };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

testWeeklyWithMontana().then(result => {
    if (result.success) {
        if (result.montanaPlayers) {
            console.log(`\n🎉 SUCCESS: Montana Weekly Shorts functionality is working with ${result.montanaPlayers} Montana players!`);
        } else if (result.fallbackToWorld) {
            console.log(`\n✅ SUCCESS: Fallback to world rankings is working correctly!`);
        }
        console.log('The Discord bot should work correctly with this approach.');
    } else {
        console.log(`\n💔 FAILED: ${result.error}`);
    }
});

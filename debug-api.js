const fetch = require('node-fetch');
const { APILogin } = require("./functions/authentication.js");

async function testCampaignLeaderboard() {
    try {
        console.log('🔧 DEBUG: Testing Campaign Leaderboard API...\n');
        
        // Get API credentials
        const APICredentials = await APILogin();
        console.log('✅ Authentication successful\n');
        
        // First, get the current weekly shorts campaign
        console.log('📡 Getting current weekly shorts campaign...');
        const campaignResponse = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
            }
        });
        
        if (!campaignResponse.ok) {
            console.log(`❌ Campaign API failed: ${campaignResponse.status}`);
            return;
        }
        
        const weeklyData = await campaignResponse.json();
        const currentCampaign = weeklyData.campaignList[0];
        const campaignId = currentCampaign.id || currentCampaign.seasonUid || currentCampaign.uid;
        
        console.log(`📋 Campaign: ${currentCampaign.name}`);
        console.log(`📋 Campaign ID: ${campaignId}\n`);
        
        // Test different campaign leaderboard API endpoints
        const testEndpoints = [
            `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${campaignId}/top?length=100&onlyWorld=false&offset=0`,
            `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${campaignId}/top?length=100&offset=0`,
            `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${campaignId}/top`,
            `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/group/${campaignId}/top?length=100&offset=0`
        ];
        
        const headers = {
            'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
            'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
        };
        
        for (let i = 0; i < testEndpoints.length; i++) {
            const endpoint = testEndpoints[i];
            console.log(`\n🔍 Testing endpoint ${i + 1}:`);
            console.log(`   ${endpoint}`);
            
            try {
                const response = await fetch(endpoint, { headers });
                console.log(`   Status: ${response.status}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`   Response keys: [${Object.keys(data).join(', ')}]`);
                    
                    if (data.tops) {
                        console.log(`   Zones found: ${data.tops.length}`);
                        if (data.tops.length > 0) {
                            console.log(`   First zone:`, {
                                zoneName: data.tops[0].zoneName,
                                playerCount: data.tops[0].top?.length || 0
                            });
                        }
                    } else {
                        console.log(`   No 'tops' array found`);
                        console.log(`   Full response (first 500 chars): ${JSON.stringify(data).substring(0, 500)}...`);
                    }
                } else {
                    const errorText = await response.text();
                    console.log(`   Error: ${errorText}`);
                }
            } catch (error) {
                console.log(`   Error: ${error.message}`);
            }
        }
        
        // Also test a single map from the campaign to see if zone data works there
        if (currentCampaign.playlist && currentCampaign.playlist.length > 0) {
            const firstMapUid = currentCampaign.playlist[0].mapUid;
            console.log(`\n🗺️ Testing single map zone leaderboard for: ${firstMapUid}`);
            
            const mapLeaderboardUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${firstMapUid}/top?length=100&offset=0`;
            console.log(`   ${mapLeaderboardUrl}`);
            
            try {
                const response = await fetch(mapLeaderboardUrl, { headers });
                console.log(`   Status: ${response.status}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`   Zones found: ${data.tops?.length || 0}`);
                    
                    if (data.tops && data.tops.length > 0) {
                        console.log(`   Available zones: ${data.tops.map(z => z.zoneName).join(', ')}`);
                        
                        // Look for Montana zone
                        const montanaZone = data.tops.find(zone => 
                            zone.zoneName?.toLowerCase().includes('montana')
                        );
                        
                        if (montanaZone) {
                            console.log(`   🏔️ Montana zone found! Players: ${montanaZone.top?.length || 0}`);
                            if (montanaZone.top && montanaZone.top.length > 0) {
                                console.log(`   First Montana player:`, {
                                    accountId: montanaZone.top[0].accountId,
                                    position: montanaZone.top[0].position,
                                    sp: montanaZone.top[0].sp
                                });
                            }
                        } else {
                            console.log(`   ⚠️ No Montana zone found in map leaderboard`);
                        }
                    }
                }
            } catch (error) {
                console.log(`   Error: ${error.message}`);
            }
        }
        
        console.log('\n🏁 Debug test completed');
        
    } catch (error) {
        console.log(`❌ Debug test failed: ${error.message}`);
    }
}

// Run the test
testCampaignLeaderboard().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});

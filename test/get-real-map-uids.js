// Test to get real Weekly Shorts map UIDs for testing
const { APILogin } = require('../functions/authentication.js');
const fetch = require('node-fetch');

async function getRealMapUids() {
    try {
        console.log('🔐 Getting API credentials...');
        const apiCredentials = await APILogin();
        
        console.log('📡 Fetching Weekly Shorts data...');
        const response = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${apiCredentials[2].accessToken}`,
                'User-Agent': 'state-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: taylordouglashutchens@outlook.com'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        const campaign = data.campaignList[0];
        
        console.log(`\n📊 Current Weekly Shorts Campaign: ${campaign.name}`);
        console.log(`Maps available: ${campaign.playlist.length}`);
        console.log('\n🗺️ Map UIDs:');
        
        campaign.playlist.slice(0, 3).forEach((track, index) => {
            console.log(`${index + 1}. ${track.mapUid}`);
        });
        
        return campaign.playlist[0].mapUid;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

getRealMapUids();

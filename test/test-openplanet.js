const { APILogin } = require('../functions/authentication.js');
const fetch = require('node-fetch');
require('dotenv').config();

async function testOpenPlanetAPI() {
    console.log('Testing OpenPlanet/Nadeo weekly shorts API...');
    
    try {
        // Get authentication for Nadeo services
        console.log('Getting API credentials...');
        const apiCreds = await APILogin();
        console.log('Authentication successful!');
        
        // Test the weekly shorts endpoint
        console.log('\nTesting weekly shorts endpoint...');
        const response = await fetch('https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1', {
            headers: {
                'Authorization': `nadeo_v1 t=${apiCreds[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Weekly shorts data received:');
            console.log(`Item count: ${data.itemCount}`);
            console.log(`Campaign list length: ${data.campaignList.length}`);
            
            if (data.campaignList.length > 0) {
                const campaign = data.campaignList[0];
                console.log(`\nLatest campaign: ${campaign.name} (ID: ${campaign.id})`);
                console.log(`Tracks in playlist: ${campaign.playlist.length}`);
                
                console.log('\nTrack UIDs:');
                campaign.playlist.forEach((track, index) => {
                    console.log(`  ${index + 1}. Position ${track.position}: ${track.mapUid}`);
                });
                
                return { success: true, campaign, data };
            } else {
                console.log('No campaigns found in response');
                return { success: false, error: 'No campaigns in response' };
            }
        } else {
            const errorText = await response.text();
            console.log('❌ API request failed:', response.status);
            console.log('Error response:', errorText);
            return { success: false, error: `API returned ${response.status}` };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
testOpenPlanetAPI().then(result => {
    if (result.success) {
        console.log('\n🎉 OpenPlanet API is working! This can replace the broken trackmania.io API.');
    } else {
        console.log('\n💔 OpenPlanet API test failed.');
    }
});

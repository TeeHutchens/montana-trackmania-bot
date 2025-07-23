const TMIO = require('trackmania.io');
const { APILogin } = require('../functions/authentication.js');
const fetch = require('node-fetch');
require('dotenv').config();

TMIOclient = new TMIO.Client();
TMIOclient.setUserAgent('montana-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord');

async function testAPI() {
    console.log('Testing trackmania.io API...');
    
    try {
        // Test 1: Use hardcoded Weekly Shorts data (most reliable approach)
        console.log('\n1. Using manually curated Weekly Shorts data...');
        
        // Manually maintained list of recent Weekly Shorts campaigns
        // Update these periodically by checking https://trackmania.io/#/campaigns/weekly
        const recentWeeklyShorts = [
            {
                id: 104528,
                name: 'Weekly Shorts #104528',
                tracks: [
                    { name: 'Track 1', mapUid: 'EXAMPLE_UID_1', author: 'EXAMPLE_AUTHOR_1' },
                    { name: 'Track 2', mapUid: 'EXAMPLE_UID_2', author: 'EXAMPLE_AUTHOR_2' },
                    // Add more tracks as you discover them
                ]
            }
        ];
        
        console.log('Using curated Weekly Shorts data:');
        console.log(`Found ${recentWeeklyShorts.length} weekly campaigns`);
        
        if (recentWeeklyShorts.length > 0) {
            const latest = recentWeeklyShorts[0];
            console.log(`Latest: ${latest.name} with ${latest.tracks.length} tracks`);
            
            // Test with the first track
            if (latest.tracks.length > 0) {
                const firstTrack = latest.tracks[0];
                console.log(`First track: ${firstTrack.name} (${firstTrack.mapUid})`);
                
                // Note: You'll need to update these UIDs manually by checking trackmania.io
                console.log('⚠️  Note: Track UIDs need to be manually updated from https://trackmania.io/#/campaigns/weekly');
            }
        }
        
        if (search && search.length > 0) {
            console.log('First campaign:', search[0].name);
            
            // Test 2: Get campaign details
            console.log('\n2. Testing campaign details...');
            const campaign = await search[0].getCampaign();
            console.log(`Campaign has ${campaign._data.playlist.length} tracks`);
            
            if (campaign._data.playlist.length > 0) {
                const firstTrack = campaign._data.playlist[0];
                console.log('First track:', firstTrack.name, 'UID:', firstTrack.mapUid);
            }
        }
        
        // Test 3: Trackmania API authentication
        console.log('\n3. Testing Trackmania API authentication...');
        const apiCreds = await APILogin();
        console.log('Authentication successful!');
        console.log('Tokens obtained:', {
            ubiTicket: apiCreds[0]?.ticket ? 'YES' : 'NO',
            nadeoAccessToken: apiCreds[1]?.accessToken ? 'YES' : 'NO',
            trackmaniaNadeoToken: apiCreds[2]?.accessToken ? 'YES' : 'NO',
            finalToken: apiCreds[3] ? 'YES' : 'NO'
        });
        
    } catch (error) {
        console.error('API Test Error:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Additional debugging for network/JSON errors
        if (error.message.includes('Unexpected token < in JSON')) {
            console.error('\n⚠️  This error suggests the API is returning HTML instead of JSON.');
            console.error('   This could mean:');
            console.error('   - The API endpoint is down or changed');
            console.error('   - Rate limiting is in effect');
            console.error('   - Authentication is failing');
        }
    }
}

testAPI();

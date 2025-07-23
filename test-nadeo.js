const { APILogin } = require('./functions/authentication.js');
const fetch = require('node-fetch');
require('dotenv').config();

async function testNadeoAPI() {
    console.log('Testing Nadeo Live Services API...');
    
    try {
        // Get authentication
        console.log('Getting API credentials...');
        const apiCreds = await APILogin();
        console.log('Authentication successful!');
        
        // Try to get campaigns from Nadeo API
        console.log('\nTesting Nadeo campaigns endpoint...');
        
        const campaignsResponse = await fetch('https://live-services.trackmania.nadeo.live/api/token/campaigns', {
            headers: {
                'Authorization': `nadeo_v1 t=${apiCreds[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
            }
        });
        
        if (campaignsResponse.ok) {
            const campaigns = await campaignsResponse.json();
            console.log(`Found ${campaigns.length} campaigns`);
            
            // Look for weekly campaigns
            const weeklyCampaigns = campaigns.filter(campaign => 
                campaign.name.toLowerCase().includes('weekly') || 
                campaign.name.toLowerCase().includes('short')
            );
            
            console.log(`Found ${weeklyCampaigns.length} weekly/short campaigns:`);
            weeklyCampaigns.forEach((campaign, index) => {
                console.log(`${index + 1}. ${campaign.name} (ID: ${campaign.campaignId})`);
            });
            
            // If we found weekly campaigns, get details of the first one
            if (weeklyCampaigns.length > 0) {
                const firstWeekly = weeklyCampaigns[0];
                console.log(`\nGetting details for: ${firstWeekly.name}`);
                
                const detailResponse = await fetch(`https://live-services.trackmania.nadeo.live/api/token/campaign/${firstWeekly.campaignId}`, {
                    headers: {
                        'Authorization': `nadeo_v1 t=${apiCreds[2].accessToken}`,
                        'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards and player stats | Contact: @TeeHutchy on Discord'
                    }
                });
                
                if (detailResponse.ok) {
                    const details = await detailResponse.json();
                    console.log(`Campaign has ${details.playlist?.length || 0} tracks`);
                    
                    if (details.playlist && details.playlist.length > 0) {
                        console.log('First track:', details.playlist[0].name);
                    }
                } else {
                    console.log('Could not get campaign details:', detailResponse.status);
                }
            }
            
        } else {
            console.log('Campaigns endpoint failed:', campaignsResponse.status);
            const errorText = await campaignsResponse.text();
            console.log('Error response:', errorText.substring(0, 200));
        }
        
    } catch (error) {
        console.error('Nadeo API Test Error:', error.message);
    }
}

testNadeoAPI();

const { loginUbi, loginTrackmaniaUbi, loginTrackmaniaNadeo } = require('trackmania-api-node');
const fetch = require('node-fetch');
require('dotenv').config();

async function testFreshAuth() {
    console.log('🧪 Testing fresh authentication with different scopes...');
    
    try {
        const username = process.env.UBI_USERNAME;
        const password = process.env.UBI_PASSWORD;
        
        console.log(`Authenticating: ${username}`);
        
        // Step 1: Ubi login
        const credentials = Buffer.from(username + ':' + password).toString('base64');
        const ubiLogin = await loginUbi(credentials);
        console.log('✅ Ubi login successful');
        
        // Step 2: Trackmania Ubi login
        const tmUbiLogin = await loginTrackmaniaUbi(ubiLogin.ticket);
        console.log('✅ Trackmania Ubi login successful');
        
        // Step 3: Try different Nadeo services
        const services = ['NadeoLiveServices', 'NadeoClubServices', 'NadeoServices'];
        
        for (const service of services) {
            try {
                console.log(`\n🔑 Testing service: ${service}`);
                const nadeoLogin = await loginTrackmaniaNadeo(tmUbiLogin.accessToken, service);
                console.log(`✅ ${service} authentication successful`);
                
                // Test Montana access with this service
                const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
                const leaderboardUrl = `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${testMapUid}/top?length=100&offset=0`;
                
                const response = await fetch(leaderboardUrl, {
                    headers: {
                        'Authorization': `nadeo_v1 t=${nadeoLogin.accessToken}`,
                        'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`  📊 Zones available: ${data.tops?.length || 0}`);
                    
                    if (data.tops && data.tops.length > 1) {
                        console.log('  📍 Available zones:');
                        data.tops.forEach((zone, i) => {
                            console.log(`    ${i + 1}. ${zone.zoneName} - ${zone.top?.length || 0} players`);
                        });
                        
                        const montanaZone = data.tops.find(zone => 
                            zone.zoneName === 'Montana' || zone.zoneId === '3022e37a-7e13-11e8-8060-e284abfd2bc4'
                        );
                        
                        if (montanaZone) {
                            console.log(`  🏔️ MONTANA FOUND with ${service}! Players: ${montanaZone.top?.length || 0}`);
                            return { success: true, service: service, montanaPlayers: montanaZone.top?.length || 0 };
                        }
                    }
                } else {
                    console.log(`  ❌ API call failed: ${response.status}`);
                }
                
            } catch (serviceError) {
                console.log(`  ❌ ${service} failed: ${serviceError.message}`);
            }
        }
        
        return { success: false, message: 'No Montana access found with any service' };
        
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        return { success: false, error: error.message };
    }
}

testFreshAuth().then(result => {
    if (result.success) {
        console.log(`\n🎉 SUCCESS! Montana access found with ${result.service}`);
        console.log(`Montana players: ${result.montanaPlayers}`);
    } else {
        console.log(`\n💔 Montana access not yet available`);
        console.log('This could mean:');
        console.log('1. The purchased access needs more time to propagate');
        console.log('2. Additional account verification is required');
        console.log('3. Different API endpoints are needed for the new access level');
    }
});

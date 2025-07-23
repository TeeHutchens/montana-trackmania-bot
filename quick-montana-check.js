// Quick test to see if access is working now
const { APILogin } = require('./functions/authentication.js');
const fetch = require('node-fetch');
require('dotenv').config();

async function quickMontanaCheck() {
    console.log('🏔️ Quick Montana access check...');
    
    try {
        const APICredentials = await APILogin();
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
        
        const response = await fetch(`https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${testMapUid}/top?length=100&offset=0`, {
            headers: {
                'Authorization': `nadeo_v1 t=${APICredentials[2].accessToken}`,
                'User-Agent': 'montana-trackmania-bot'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const montanaZone = data.tops?.find(zone => 
                zone.zoneName === 'Montana' || zone.zoneId === '3022e37a-7e13-11e8-8060-e284abfd2bc4'
            );
            
            if (montanaZone) {
                console.log(`🎉 Montana access is NOW WORKING! Found ${montanaZone.top?.length || 0} players`);
                return true;
            } else {
                console.log(`❌ Montana access still not available. Found ${data.tops?.length || 0} zones total`);
                return false;
            }
        } else {
            console.log(`❌ API call failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

// Run the check
quickMontanaCheck().then(hasAccess => {
    if (hasAccess) {
        console.log('\n✅ You can now use the Montana functionality!');
    } else {
        console.log('\n⏰ Montana access not yet active. Try again in 15-30 minutes or after launching the game.');
    }
});

// Export for use in other files
module.exports = { quickMontanaCheck };

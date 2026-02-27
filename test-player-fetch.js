// Test script for player name fetching
const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client();
require('dotenv').config();

async function testPlayerFetch() {
    console.log('🧪 Testing player name fetching with TMIO API...\n');

    try {
        // Test account IDs from your Montana leaderboard
        const testAccountIds = [
            '8ac2e3be-31e9-4e33-b3a5-2fb26c3527df',  // Position 1
            'c1477572-e8b9-4ece-824b-ac2cec0042c9',  // Position 2
            'b12cb69d-72c9-43a3-bf3f-4d86180e5244',  // Position 3
            '4a7c2b5e-78a1-44f0-8af6-76baea50b8f3',  // Position 4
            'b5e2fccc-cf50-41b9-bb90-4f5866e994da'   // Position 5
        ];

        console.log(`📋 Testing with ${testAccountIds.length} account IDs\n`);

        // Test TMIO API
        console.log('🔍 Calling TMIO API for each player...\n');

        for (const accountId of testAccountIds) {
            try {
                console.log(`Fetching ${accountId}...`);
                const player = await TMIOclient.players.get(accountId);

                if (player && player.name) {
                    console.log(`✅ ${accountId}: ${player.name}\n`);
                } else {
                    console.log(`⚠️ ${accountId}: No name returned\n`);
                }
            } catch (error) {
                console.log(`❌ ${accountId}: Error - ${error.message}\n`);
            }
        }

        console.log('✅ Test complete!')

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testPlayerFetch();

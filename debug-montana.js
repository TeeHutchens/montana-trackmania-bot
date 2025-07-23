const { APILogin } = require('./functions/authentication.js');
const { getTopPlayersGroup } = require('trackmania-api-node');
require('dotenv').config();

async function debugMontanaGroup() {
    console.log('Debugging Montana group leaderboard structure...');
    
    try {
        const APICredentials = await APILogin();
        const montanaGroupUid = process.env.GROUP_UID;
        
        console.log(`Testing Montana Group UID: ${montanaGroupUid}`);
        
        // Get Montana group leaderboard
        const topPlayersResult = await getTopPlayersGroup(APICredentials[3], montanaGroupUid);
        
        console.log('\nMontana Group Result Structure:');
        console.log(JSON.stringify(topPlayersResult, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Full error:', error);
    }
}

debugMontanaGroup();

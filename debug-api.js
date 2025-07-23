const { getCachedMapInfo } = require('./functions/functions.js');
const { APILogin } = require('./functions/authentication.js');
require('dotenv').config();

async function debugRawAPI() {
    console.log('🔍 Debugging raw API responses...');
    
    try {
        // Get fresh API credentials
        const credentials = await APILogin();
        
        // Test with the two problematic map UIDs from your output
        const testMaps = [
            { uid: 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30', expectedName: 'Red Driveby' },
            { uid: 'Q1QBka2u2mr1hYH49umDP4XCR0c', expectedName: 'Mirage' }
        ];
        
        for (const map of testMaps) {
            console.log(`\n--- Testing Map ${map.uid} ---`);
            console.log(`Expected clean name: ${map.expectedName}`);
            
            const result = await getCachedMapInfo(map.uid, credentials, false);
            console.log(`Final cached result: "${result.name}"`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugRawAPI();

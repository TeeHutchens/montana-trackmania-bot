const { getCachedMapInfo } = require('./functions/functions.js');

async function testRawData() {
    console.log('🧪 Testing raw API data...');
    
    // Simulate an API credentials array (the structure from your bot)
    // We'll use dummy data since we just want to see the raw API response
    const mockCredentials = [null, null, { accessToken: 'dummy-token' }];
    
    // Test with a known map UID from your shorts data
    const testMapUid = 'CTtO7z_O5qzpGpBHsJYZBOyFhZS'; // One from your previous tests
    
    try {
        const result = await getCachedMapInfo(testMapUid, mockCredentials, false);
        console.log('\n📊 Final result:', result);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testRawData();

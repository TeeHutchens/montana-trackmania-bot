// Test the cached functions with real API calls
const { getMontanaTopPlayerTimes } = require('../functions/functions.js');

async function testCachedFunctions() {
    console.log('🧪 Testing Cached Functions with Real API...\n');
    
    try {
        // Test with a known map UID (from recent weekly shorts)
        const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30'; // Red Driveby
        
        console.log('🚀 First call (should fetch from API and cache):');
        console.time('First Call');
        const result1 = await getMontanaTopPlayerTimes(testMapUid);
        console.timeEnd('First Call');
        console.log('Result length:', result1.length);
        console.log('');
        
        console.log('🚀 Second call (should use cache):');
        console.time('Second Call');
        const result2 = await getMontanaTopPlayerTimes(testMapUid);
        console.timeEnd('Second Call');
        console.log('Result length:', result2.length);
        console.log('');
        
        console.log('📊 Results match:', result1 === result2 ? '✅' : '❌');
        
        // Show cache stats
        const PlayerCache = require('../cache/PlayerCache.js');
        const cache = new PlayerCache();
        console.log('\n📊 Cache stats after test:');
        console.log(cache.getStats());
        
    } catch (error) {
        console.error('❌ Error testing cached functions:', error.message);
    }
}

testCachedFunctions();

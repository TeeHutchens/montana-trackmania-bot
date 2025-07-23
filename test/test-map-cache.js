// Test map caching functionality
const { getCachedMapInfo } = require('../functions/functions.js');
const { APILogin } = require('../functions/authentication.js');
const MapCache = require('../cache/MapCache.js');

async function testMapCache() {
    console.log('🧪 Testing Map Cache Functionality');
    console.log('=' .repeat(50));

    try {
        // Get API credentials
        console.log('🔐 Getting API credentials...');
        const apiCredentials = await APILogin();
        console.log('✅ API credentials obtained');

        // Test with a known map UID (this is a common test map)
        const testMapUid = 'D8aZXPCTdnAR6YM8L3AjOzUr3U7'; // Example map UID

        console.log('\n📊 Initial cache state:');
        const mapCache = new MapCache();
        const initialStats = mapCache.getStats();
        console.log(`Total maps in cache: ${initialStats.total}`);
        console.log(`Valid maps: ${initialStats.valid}`);
        console.log(`Cache duration: ${initialStats.cacheDurationMinutes} minutes`);

        // First call - should fetch from API and cache
        console.log('\n🔍 First call (should fetch from API):');
        const start1 = Date.now();
        const mapInfo1 = await getCachedMapInfo(testMapUid, apiCredentials);
        const duration1 = Date.now() - start1;
        
        console.log(`Map Name: ${mapInfo1.name}`);
        console.log(`Author: ${mapInfo1.authorName} (${mapInfo1.author})`);
        console.log(`Duration: ${duration1}ms`);

        // Second call - should use cache
        console.log('\n📦 Second call (should use cache):');
        const start2 = Date.now();
        const mapInfo2 = await getCachedMapInfo(testMapUid, apiCredentials);
        const duration2 = Date.now() - start2;
        
        console.log(`Map Name: ${mapInfo2.name}`);
        console.log(`Author: ${mapInfo2.authorName} (${mapInfo2.author})`);
        console.log(`Duration: ${duration2}ms`);

        // Verify data consistency
        console.log('\n✅ Data consistency check:');
        console.log(`Names match: ${mapInfo1.name === mapInfo2.name}`);
        console.log(`Authors match: ${mapInfo1.authorName === mapInfo2.authorName}`);
        console.log(`Performance improvement: ${Math.round(((duration1 - duration2) / duration1) * 100)}%`);

        // Check final cache state
        console.log('\n📊 Final cache state:');
        const finalStats = mapCache.getStats();
        console.log(`Total maps in cache: ${finalStats.total}`);
        console.log(`Valid maps: ${finalStats.valid}`);

        // Show cache entry details
        const cacheInfo = mapCache.getCacheEntryInfo(testMapUid);
        if (cacheInfo) {
            console.log('\n🗺️ Cache entry details:');
            console.log(`Map: ${cacheInfo.mapName}`);
            console.log(`Age: ${cacheInfo.ageMinutes} minutes`);
            console.log(`Remaining: ${cacheInfo.remainingMinutes} minutes`);
            console.log(`Expired: ${cacheInfo.isExpired}`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testMapCache();

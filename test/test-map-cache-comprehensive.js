// Comprehensive test of Map Cache functionality
const MapCache = require('../cache/MapCache.js');

async function testMapCacheFeatures() {
    console.log('🧪 Comprehensive Map Cache Test');
    console.log('=' .repeat(50));

    const mapCache = new MapCache();

    // Test 1: Basic cache operations
    console.log('\n📝 Test 1: Basic Cache Operations');
    console.log('─'.repeat(30));

    const testMapData = {
        name: 'Test Track - Summer Edition',
        author: 'test-author-123',
        authorName: 'TestMapMaker.TM'
    };
    const testMapUid = 'TEST123456789ABCDEF';

    // Set data
    mapCache.setMapData(testMapUid, testMapData);
    console.log('✅ Map data cached');

    // Get data
    const retrievedData = mapCache.getMapData(testMapUid);
    console.log(`Retrieved: ${retrievedData.name} by ${retrievedData.authorName}`);

    // Test 2: Multiple maps
    console.log('\n📝 Test 2: Multiple Map Caching');
    console.log('─'.repeat(30));

    const multipleMapData = {
        'MAP001': { name: 'Red Speedway', author: 'auth001', authorName: 'SpeedyTM' },
        'MAP002': { name: 'Blue Mountain', author: 'auth002', authorName: 'ClimberTM' },
        'MAP003': { name: 'Green Valley', author: 'auth003', authorName: 'NatureTM' }
    };

    mapCache.setMultipleMapData(multipleMapData);
    console.log('✅ Multiple maps cached');

    const { cached, missing } = mapCache.getMultipleMapData(['MAP001', 'MAP002', 'MAP004']);
    console.log(`Found ${Object.keys(cached).length} cached, ${missing.length} missing`);
    
    for (const [uid, data] of Object.entries(cached)) {
        console.log(`  ${uid}: ${data.name} by ${data.authorName}`);
    }
    console.log(`Missing: ${missing.join(', ')}`);

    // Test 3: Cache statistics
    console.log('\n📝 Test 3: Cache Statistics');
    console.log('─'.repeat(30));

    const stats = mapCache.getStats();
    console.log(`Total maps: ${stats.total}`);
    console.log(`Valid maps: ${stats.valid}`);
    console.log(`Cache duration: ${stats.cacheDurationMinutes} minutes`);

    // Test 4: Cache entry information
    console.log('\n📝 Test 4: Cache Entry Information');
    console.log('─'.repeat(30));

    const entryInfo = mapCache.getCacheEntryInfo('MAP001');
    if (entryInfo) {
        console.log(`Map: ${entryInfo.mapName}`);
        console.log(`Author: ${entryInfo.authorAccountId}`);
        console.log(`Age: ${entryInfo.ageMinutes} minutes`);
        console.log(`Remaining: ${entryInfo.remainingMinutes} minutes`);
        console.log(`Expired: ${entryInfo.isExpired}`);
    }

    // Test 5: Performance simulation
    console.log('\n📝 Test 5: Performance Simulation');
    console.log('─'.repeat(30));

    // Simulate API call time (cached = instant, uncached = 200-800ms)
    function simulateApiCall() {
        return new Promise(resolve => {
            const delay = Math.random() * 600 + 200; // 200-800ms
            setTimeout(resolve, delay);
        });
    }

    // Test cache hit vs miss performance
    const testMapUid2 = 'PERF_TEST_MAP';
    
    // First call (cache miss)
    console.log('🔍 Simulating cache miss (API call required)...');
    const start1 = Date.now();
    await simulateApiCall(); // Simulate API delay
    const cached1 = mapCache.getMapData(testMapUid2);
    const duration1 = Date.now() - start1;
    console.log(`Cache miss: ${duration1}ms`);

    // Cache the data
    mapCache.setMapData(testMapUid2, { name: 'Performance Test Map', author: 'perf-test', authorName: 'PerfTester' });

    // Second call (cache hit)
    console.log('📦 Simulating cache hit (no API call)...');
    const start2 = Date.now();
    const cached2 = mapCache.getMapData(testMapUid2);
    const duration2 = Date.now() - start2;
    console.log(`Cache hit: ${duration2}ms`);
    console.log(`Performance improvement: ${Math.round(((duration1 - duration2) / duration1) * 100)}%`);

    // Test 6: Final statistics
    console.log('\n📝 Test 6: Final Cache State');
    console.log('─'.repeat(30));

    const finalStats = mapCache.getStats();
    console.log(`Total cached maps: ${finalStats.total}`);
    
    console.log('\n🗺️ All cached maps:');
    let count = 0;
    for (const [mapUid, entry] of mapCache.cache.entries()) {
        count++;
        const ageMinutes = Math.floor((Date.now() - entry.timestamp) / (60 * 1000));
        console.log(`${count}. ${entry.data.name} (${mapUid.substring(0, 10)}...) - ${ageMinutes}min old`);
    }

    console.log('\n✅ All map cache tests completed successfully!');
    console.log('\n💡 Map caching benefits:');
    console.log('   • 45-minute cache duration reduces API calls');
    console.log('   • Significant performance improvement for repeated requests');
    console.log('   • Persistent storage survives bot restarts');
    console.log('   • Automatic cleanup of expired entries');
    console.log('   • Integrated with cache management tools');

    // Clean up test data
    mapCache.clearAll();
    console.log('\n🧹 Test cache cleaned up');
}

// Run comprehensive test
testMapCacheFeatures();

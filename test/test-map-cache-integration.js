// Test map caching with Weekly Shorts integration
const { getWeeklyShorts } = require('../functions/functions.js');
const MapCache = require('../cache/MapCache.js');

async function testMapCacheIntegration() {
    console.log('🧪 Testing Map Cache Integration with Weekly Shorts');
    console.log('=' .repeat(60));

    try {
        const mapCache = new MapCache();
        
        console.log('\n📊 Initial cache state:');
        const initialStats = mapCache.getStats();
        console.log(`Total maps in cache: ${initialStats.total}`);
        console.log(`Valid maps: ${initialStats.valid}`);
        console.log(`Cache duration: ${initialStats.cacheDurationMinutes} minutes`);

        // First call to getWeeklyShorts - should populate cache
        console.log('\n🔍 First call to getWeeklyShorts (should populate cache):');
        const start1 = Date.now();
        const results1 = await getWeeklyShorts();
        const duration1 = Date.now() - start1;
        
        console.log(`Retrieved ${results1.length} weekly shorts`);
        console.log(`Duration: ${duration1}ms`);

        // Check cache after first call
        console.log('\n📊 Cache state after first call:');
        const midStats = mapCache.getStats();
        console.log(`Total maps in cache: ${midStats.total}`);
        console.log(`Valid maps: ${midStats.valid}`);

        // Wait a moment, then make second call
        console.log('\n⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Second call - should use cached map data
        console.log('\n📦 Second call to getWeeklyShorts (should use cached maps):');
        const start2 = Date.now();
        const results2 = await getWeeklyShorts();
        const duration2 = Date.now() - start2;
        
        console.log(`Retrieved ${results2.length} weekly shorts`);
        console.log(`Duration: ${duration2}ms`);

        // Performance comparison
        console.log('\n⚡ Performance Analysis:');
        console.log(`First call: ${duration1}ms`);
        console.log(`Second call: ${duration2}ms`);
        console.log(`Performance improvement: ${Math.round(((duration1 - duration2) / duration1) * 100)}%`);

        // Final cache state
        console.log('\n📊 Final cache state:');
        const finalStats = mapCache.getStats();
        console.log(`Total maps in cache: ${finalStats.total}`);
        console.log(`Valid maps: ${finalStats.valid}`);

        // Show cache entries
        if (finalStats.total > 0) {
            console.log('\n🗺️ Cached maps:');
            let count = 0;
            for (const [mapUid, entry] of mapCache.cache.entries()) {
                count++;
                const ageMinutes = Math.floor((Date.now() - entry.timestamp) / (60 * 1000));
                const remainingMinutes = Math.max(0, 45 - ageMinutes);
                console.log(`${count}. ${entry.data.name} - ${ageMinutes}min old, ${remainingMinutes}min remaining`);
            }
        }

        console.log('\n✅ Map cache integration test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testMapCacheIntegration();

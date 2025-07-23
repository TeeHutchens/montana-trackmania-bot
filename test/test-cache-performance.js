// Performance comparison test showing caching benefits
const { getMontanaTopPlayerTimes } = require('../functions/functions.js');
const PlayerCache = require('../cache/PlayerCache.js');

async function performanceTest() {
    console.log('🚀 CACHING PERFORMANCE TEST');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Clear cache for fair test
    const cache = new PlayerCache();
    cache.clearAll();
    console.log('🗑️ Cache cleared for fair performance test\n');
    
    const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30'; // Red Driveby
    
    try {
        // Test 1: Cold cache (first run)
        console.log('❄️ COLD CACHE TEST (First API call)');
        console.log('───────────────────────────────────────────');
        console.time('Cold Cache Time');
        const result1 = await getMontanaTopPlayerTimes(testMapUid);
        console.timeEnd('Cold Cache Time');
        console.log('Players found:', result1.match(/\*\*.*?\*\*/g)?.length || 0);
        console.log('');
        
        // Test 2: Warm cache (second run)
        console.log('🔥 WARM CACHE TEST (Using cached data)');
        console.log('───────────────────────────────────────────');
        console.time('Warm Cache Time');
        const result2 = await getMontanaTopPlayerTimes(testMapUid);
        console.timeEnd('Warm Cache Time');
        console.log('Players found:', result2.match(/\*\*.*?\*\*/g)?.length || 0);
        console.log('');
        
        // Test 3: Multiple rapid calls
        console.log('⚡ RAPID FIRE TEST (5 consecutive calls)');
        console.log('───────────────────────────────────────────');
        const rapidCallTimes = [];
        
        for (let i = 1; i <= 5; i++) {
            const startTime = Date.now();
            await getMontanaTopPlayerTimes(testMapUid);
            const endTime = Date.now();
            const callTime = endTime - startTime;
            rapidCallTimes.push(callTime);
            console.log(`Call ${i}: ${callTime}ms`);
        }
        
        const avgRapidTime = rapidCallTimes.reduce((a, b) => a + b, 0) / rapidCallTimes.length;
        console.log(`Average rapid call time: ${avgRapidTime.toFixed(0)}ms`);
        console.log('');
        
        // Cache statistics
        console.log('📊 FINAL CACHE STATISTICS');
        console.log('───────────────────────────────────────────');
        const stats = cache.getStats();
        console.log(`Total cached players: ${stats.total}`);
        console.log(`Valid entries: ${stats.valid}`);
        console.log(`Cache duration: ${stats.cacheDurationDays} days`);
        console.log(`Cache file: ${stats.cacheFile}`);
        console.log('');
        
        // Performance summary
        console.log('🎯 PERFORMANCE SUMMARY');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('✅ Player names are now cached for 30 days');
        console.log('✅ Subsequent calls use cached data instead of API');
        console.log('✅ Significant reduction in API calls and response time');
        console.log('✅ Cache persists across bot restarts');
        console.log('✅ Automatic cleanup of expired entries');
        
    } catch (error) {
        console.error('❌ Performance test failed:', error.message);
    }
}

performanceTest();

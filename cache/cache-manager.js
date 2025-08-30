// Cache management utility for both Player and Map caches
const PlayerCache = require('../cache/PlayerCache.js');
const MapCache = require('../cache/MapCache.js');

const playerCache = new PlayerCache();
const mapCache = new MapCache();

// Command line interface for cache management
const command = process.argv[2];
const cacheType = process.argv[3]; // 'player', 'map', or 'all'

function showPlayerCache() {
    console.log('📊 Player Cache Statistics:');
    console.log(playerCache.getStats());
    console.log('');
    console.log('📋 Cached Player Names:');
    let count = 0;
    for (const [accountId, entry] of playerCache.cache.entries()) {
        const age = Math.floor((Date.now() - entry.timestamp) / (24 * 60 * 60 * 1000));
        console.log(`${++count}. ${entry.name} (${accountId.substring(0, 8)}...) - ${age} days old`);
    }
    if (count === 0) {
        console.log('No cached player entries found');
    }
}

function showMapCache() {
    console.log('🗺️ Map Cache Statistics:');
    console.log(mapCache.getStats());
    console.log('');
    console.log('📋 Cached Maps:');
    let count = 0;
    for (const [mapUid, entry] of mapCache.cache.entries()) {
        const ageMinutes = Math.floor((Date.now() - entry.timestamp) / (60 * 1000));
        const remainingMinutes = Math.max(0, 45 - ageMinutes);
        console.log(`${++count}. ${entry.data.name || 'Unknown Map'} (${mapUid.substring(0, 8)}...) - ${ageMinutes}min old, ${remainingMinutes}min remaining`);
    }
    if (count === 0) {
        console.log('No cached map entries found');
    }
}

switch (command) {
    case 'stats':
        if (!cacheType || cacheType === 'all') {
            showPlayerCache();
            console.log('\n' + '='.repeat(50) + '\n');
            showMapCache();
        } else if (cacheType === 'player') {
            showPlayerCache();
        } else if (cacheType === 'map') {
            showMapCache();
        } else {
            console.log('❌ Invalid cache type. Use: player, map, or all');
        }
        break;
        
    case 'clean':
        if (!cacheType || cacheType === 'all') {
            console.log('🧹 Cleaning expired cache entries...');
            playerCache.cleanExpired();
            mapCache.cleanExpired();
            console.log('✅ Both caches cleaned');
        } else if (cacheType === 'player') {
            console.log('🧹 Cleaning expired player cache entries...');
            playerCache.cleanExpired();
            console.log('✅ Player cache cleaned');
        } else if (cacheType === 'map') {
            console.log('🧹 Cleaning expired map cache entries...');
            mapCache.cleanExpired();
            console.log('✅ Map cache cleaned');
        } else {
            console.log('❌ Invalid cache type. Use: player, map, or all');
        }
        break;
        
    case 'clear':
        if (!cacheType || cacheType === 'all') {
            console.log('�️ Clearing all cache entries...');
            playerCache.clearAll();
            mapCache.clearAll();
            console.log('✅ Both caches cleared');
        } else if (cacheType === 'player') {
            console.log('🗑️ Clearing player cache entries...');
            playerCache.clearAll();
            console.log('✅ Player cache cleared');
        } else if (cacheType === 'map') {
            console.log('🗑️ Clearing map cache entries...');
            mapCache.clearAll();
            console.log('✅ Map cache cleared');
        } else {
            console.log('❌ Invalid cache type. Use: player, map, or all');
        }
        break;
        
    case 'show':
        if (!cacheType || cacheType === 'all') {
            showPlayerCache();
            console.log('\n' + '='.repeat(50) + '\n');
            showMapCache();
        } else if (cacheType === 'player') {
            showPlayerCache();
        } else if (cacheType === 'map') {
            showMapCache();
        } else {
            console.log('❌ Invalid cache type. Use: player, map, or all');
        }
        break;
        
    default:
        console.log('🛠️ Cache Management Tool');
        console.log('');
        console.log('Usage: node cache-manager.js <command> [cache_type]');
        console.log('');
        console.log('Commands:');
        console.log('  stats  - Show cache statistics');
        console.log('  clean  - Remove expired entries');
        console.log('  clear  - Clear all cache entries');
        console.log('  show   - List all cached entries');
        console.log('');
        console.log('Cache Types:');
        console.log('  player - Player name cache (30 days)');
        console.log('  map    - Map data cache (45 minutes)');
        console.log('  all    - Both caches (default)');
        console.log('');
        console.log('Examples:');
        console.log('  node cache-manager.js stats');
        console.log('  node cache-manager.js clean');
        break;
}

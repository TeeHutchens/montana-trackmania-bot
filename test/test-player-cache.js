// Test the player caching system
const PlayerCache = require('../cache/PlayerCache.js');

async function testPlayerCache() {
    console.log('🧪 Testing Player Cache System...\n');
    
    const cache = new PlayerCache();
    
    // Test basic operations
    console.log('📊 Initial cache stats:');
    console.log(cache.getStats());
    console.log('');
    
    // Test setting and getting single player
    console.log('🔧 Testing single player cache operations...');
    const testAccountId = 'test-account-123';
    const testPlayerName = 'TestPlayer.TM';
    
    cache.setPlayerName(testAccountId, testPlayerName);
    const retrievedName = cache.getPlayerName(testAccountId);
    
    console.log(`Set: ${testAccountId} → ${testPlayerName}`);
    console.log(`Get: ${testAccountId} → ${retrievedName}`);
    console.log(`Match: ${retrievedName === testPlayerName ? '✅' : '❌'}`);
    console.log('');
    
    // Test multiple player operations
    console.log('🔧 Testing multiple player cache operations...');
    const testAccountIds = [
        'account-1',
        'account-2', 
        'account-3',
        'account-4'
    ];
    
    const testPlayerData = {
        'account-1': 'Player1.TM',
        'account-2': 'Player2.TM',
        'account-3': 'Player3.TM'
    };
    
    cache.setMultiplePlayerNames(testPlayerData);
    
    const result = cache.getMultiplePlayerNames(testAccountIds);
    console.log('Cached players:', result.cached);
    console.log('Missing players:', result.missing);
    console.log('');
    
    // Test cache persistence
    console.log('💾 Testing cache persistence...');
    cache.saveCache();
    
    const newCache = new PlayerCache();
    const retrievedAfterReload = newCache.getPlayerName(testAccountId);
    console.log(`Retrieved after reload: ${testAccountId} → ${retrievedAfterReload}`);
    console.log(`Persistence test: ${retrievedAfterReload === testPlayerName ? '✅' : '❌'}`);
    console.log('');
    
    // Test expiration (simulate by setting very old timestamp)
    console.log('⏰ Testing cache expiration...');
    const expiredAccountId = 'expired-account';
    const expiredPlayerName = 'ExpiredPlayer.TM';
    
    // Manually set an expired entry (31 days ago)
    const expiredTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
    newCache.cache.set(expiredAccountId, {
        name: expiredPlayerName,
        timestamp: expiredTimestamp
    });
    
    const expiredResult = newCache.getPlayerName(expiredAccountId);
    console.log(`Expired entry result: ${expiredResult}`);
    console.log(`Expiration test: ${expiredResult === null ? '✅' : '❌'}`);
    console.log('');
    
    // Final stats
    console.log('📊 Final cache stats:');
    console.log(cache.getStats());
    
    console.log('\n✅ Player cache testing complete!');
}

testPlayerCache().catch(console.error);

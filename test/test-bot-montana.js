const { getMontanaTopPlayerTimes } = require('../functions/functions.js');

async function testBotMontanaFunction() {
    console.log('🧪 Testing the bot\'s Montana function...');
    
    const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30'; // Weekly shorts track
    
    try {
        console.log(`Testing getMontanaTopPlayerTimes with map: ${testMapUid}`);
        const result = await getMontanaTopPlayerTimes(testMapUid);
        
        console.log('\n🎯 Montana function result:');
        console.log(result);
        
        if (result.includes('Montana Group')) {
            console.log('\n✅ SUCCESS: Montana function is working correctly!');
        } else if (result.includes('World Rankings')) {
            console.log('\n⚠️ FALLBACK: Montana function fell back to world rankings');
        } else {
            console.log('\n❓ UNKNOWN: Unexpected result format');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR testing Montana function:', error.message);
    }
}

testBotMontanaFunction();

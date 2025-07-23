const { getWeeklyShorts } = require('./functions/functions.js');

async function testAuthOptimization() {
    console.log('🧪 Testing Authentication Optimization');
    console.log('🔍 Watch for reduced authentication calls...');
    console.log('='.repeat(60));
    
    try {
        const results = await getWeeklyShorts();
        console.log(`✅ Successfully processed ${results.length} tracks with optimized authentication`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAuthOptimization();

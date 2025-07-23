// Test the track name cleaning with actual weekly shorts data
const { getWeeklyShorts } = require('../functions/functions.js');

async function testWeeklyShorts() {
    console.log('🧪 Testing Weekly Shorts with track name cleaning and author fixes...\n');
    
    try {
        const results = await getWeeklyShorts();
        
        if (results && results.length > 0) {
            console.log(`✅ Got ${results.length} weekly shorts results\n`);
            
            results.forEach((result, index) => {
                if (result.title) {
                    console.log(`Track ${index + 1}:`);
                    console.log(`  Title: ${result.title}`);
                    console.log(`  Author: ${result.author ? result.author.name : 'Not available'}`);
                    console.log(`  Color: ${result.color}`);
                    console.log('');
                }
            });
        } else {
            console.log('❌ No results returned');
        }
    } catch (error) {
        console.error('❌ Error testing weekly shorts:', error.message);
    }
}

testWeeklyShorts();

const { getWeeklyShorts } = require('./functions/functions.js');
require('dotenv').config();

async function testWeeklyShorts() {
    console.log('Testing Weekly Shorts function...');
    
    try {
        const results = await getWeeklyShorts();
        console.log('\n=== RESULTS ===');
        console.log(`Found ${results.length} results`);
        
        if (results.length > 0) {
            results.forEach((result, index) => {
                console.log(`\nResult ${index + 1}:`, result.title || result.name || 'Unknown');
                if (result.description) {
                    console.log('Description:', result.description.substring(0, 100) + '...');
                }
            });
        }
        
    } catch (error) {
        console.error('Test Error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testWeeklyShorts();

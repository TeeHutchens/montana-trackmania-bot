const { getMontanaTopPlayerTimes } = require('./functions/functions.js');

async function debugMontanaFunction() {
    console.log('🔍 Debugging getMontanaTopPlayerTimes function...');
    
    const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
    
    try {
        console.log(`Calling getMontanaTopPlayerTimes('${testMapUid}')...`);
        const result = await getMontanaTopPlayerTimes(testMapUid);
        
        console.log('\n📋 Raw result:');
        console.log(`Type: ${typeof result}`);
        console.log(`Length: ${result ? result.length : 'null/undefined'}`);
        console.log(`Content: "${result}"`);
        
        console.log('\n🔍 Result analysis:');
        if (result) {
            console.log('✅ Result is truthy');
            console.log(`Contains "Montana Group": ${result.includes('Montana Group')}`);
            console.log(`Contains "World Rankings": ${result.includes('World Rankings')}`);
            
            // Test the string replacement
            const testReplacement = result.replace(/\n\n🏔️ \*Montana Group Rankings\*$/, '');
            console.log(`\n🔧 After regex replacement: "${testReplacement}"`);
            console.log(`Replacement successful: ${testReplacement !== result}`);
            
            if (testReplacement === result) {
                console.log('❌ Regex replacement failed - checking exact suffix...');
                console.log('Result ends with:', JSON.stringify(result.slice(-50)));
            }
        } else {
            console.log('❌ Result is null/undefined/empty');
        }
        
    } catch (error) {
        console.error('❌ Error calling getMontanaTopPlayerTimes:', error.message);
    }
}

debugMontanaFunction();

// Test track name cleaning with the specific issue case
const { cleanTrackName } = require('../functions/functions.js');

function testTrackNameCleaning() {
    console.log('🧪 Testing Track Name Cleaning - Issue Fix');
    console.log('=' .repeat(60));

    const testCases = [
        {
            input: '$o Red Driveby',
            expected: 'Red Driveby',
            description: 'Issue case: $o followed by space'
        },
        {
            input: '$oRed Driveby',
            expected: 'Red Driveby',
            description: 'Issue case: $o directly attached'
        },
        {
            input: '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
            expected: 'Couve Gardens',
            description: 'Complex color codes'
        },
        {
            input: '$F00Red $0F0Green $00FBlue',
            expected: 'Red Green Blue',
            description: 'Multiple 3-digit codes'
        },
        {
            input: '$FF00Red $00FFGreen $0000FFBlue',
            expected: 'Red Green Blue',
            description: 'Multiple 4-digit codes'
        },
        {
            input: '$z$a$b$cTest Track',
            expected: 'Test Track',
            description: 'Single character codes'
        },
        {
            input: '$1$2$3$4$5Track Name',
            expected: 'Track Name',
            description: 'Multiple single digits'
        },
        {
            input: 'Normal Track Name',
            expected: 'Normal Track Name',
            description: 'No color codes'
        },
        {
            input: '$999Track$AAA Name$BBB Test',
            expected: 'Track Name Test',
            description: 'Mixed codes throughout'
        },
        {
            input: '$',
            expected: 'Unknown Track',
            description: 'Just a dollar sign'
        },
        {
            input: '$FFF',
            expected: 'Unknown Track',
            description: 'Only color code'
        }
    ];

    console.log('\n📋 Test Results:');
    console.log('─'.repeat(60));

    let passed = 0;
    let failed = 0;

    testCases.forEach((testCase, index) => {
        try {
            const result = cleanTrackName(testCase.input);
            const success = result === testCase.expected;
            
            console.log(`\n${index + 1}. ${testCase.description}`);
            console.log(`   Input:    "${testCase.input}"`);
            console.log(`   Expected: "${testCase.expected}"`);
            console.log(`   Result:   "${result}"`);
            console.log(`   Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
            
            if (success) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`\n${index + 1}. ${testCase.description}`);
            console.log(`   Input:    "${testCase.input}"`);
            console.log(`   Expected: "${testCase.expected}"`);
            console.log(`   Error:    ${error.message}`);
            console.log(`   Status:   ❌ ERROR`);
            failed++;
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Track name cleaning is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Review the regex patterns.');
    }
}

// Test the specific issue case first
console.log('🔍 Testing the specific reported issue:');
const issueCase = '$o Red Driveby';
const result = cleanTrackName(issueCase);
console.log(`Input: "${issueCase}"`);
console.log(`Output: "${result}"`);
console.log(`Expected: "Red Driveby"`);
console.log(`Fixed: ${result === 'Red Driveby' ? '✅ YES' : '❌ NO'}\n`);

// Run full test suite
testTrackNameCleaning();

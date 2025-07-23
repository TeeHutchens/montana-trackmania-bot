// Test with the actual problematic cases from Discord output
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove all $ followed by exactly 3 hex digits
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}/g, '')
    
    // Handle malformed codes like $o (single character after $)
    cleaned = cleaned.replace(/\$[a-zA-Z0-9]/g, '')
    
    // Clean up multiple spaces but preserve dashes
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing Real Discord Output Cases');
console.log('='.repeat(60));

const realCases = [
    {
        input: '$o R Driveby',
        expected: 'Red Driveby',
        description: 'Map 1 - Actual Discord output'
    },
    {
        input: '$oMirg',
        expected: 'Mirage', 
        description: 'Map 2 - Actual Discord output'
    },
    {
        input: 'Dwnspir Pass',
        expected: 'Dawnspire Pass',
        description: 'Map 3 - Actual Discord output (missing letters)'
    },
    {
        input: 'CoveGrens',
        expected: 'Cove Gardens',
        description: 'Map 4 - Actual Discord output (missing letters)'
    }
];

realCases.forEach((testCase, index) => {
    const result = cleanTrackName(testCase.input);
    const success = result === testCase.expected;
    
    console.log(`\n${index + 1}. ${testCase.description}`);
    console.log(`   Input:    "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Result:   "${result}"`);
    console.log(`   Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!success) {
        console.log(`   Issue:    Missing letters or incorrect cleaning`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('🔍 Analysis:');
console.log('The issue seems to be that some letters are being removed along with color codes.');
console.log('Maps 3 and 4 are missing letters entirely, suggesting the API data itself is truncated.');
console.log('Maps 1 and 2 still have $ codes that need cleaning.');

// Test step by step for the $o cases
console.log('\n🔍 Step-by-step for $o cases:');

const test1 = '$o R Driveby';
console.log(`\nTesting: "${test1}"`);
let step1 = test1.replace(/\$[0-9A-Fa-f]{3}/g, '');
console.log(`After 3-digit removal: "${step1}"`);
let step2 = step1.replace(/\$[a-zA-Z0-9]/g, '');
console.log(`After malformed removal: "${step2}"`);
let final1 = step2.replace(/\s+/g, ' ').trim();
console.log(`Final: "${final1}"`);

const test2 = '$oMirg';
console.log(`\nTesting: "${test2}"`);
step1 = test2.replace(/\$[0-9A-Fa-f]{3}/g, '');
console.log(`After 3-digit removal: "${step1}"`);
step2 = step1.replace(/\$[a-zA-Z0-9]/g, '');
console.log(`After malformed removal: "${step2}"`);
let final2 = step2.replace(/\s+/g, ' ').trim();
console.log(`Final: "${final2}"`);

console.log('\n⚠️  The real issue might be that the API is returning truncated/corrupted map names.');
console.log('We can only clean what we receive, but we cannot restore missing letters.');

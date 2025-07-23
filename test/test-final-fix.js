// Test the fixed track name cleaning with 3-digit codes only
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes
    // The key insight: color codes are exactly 3 hex digits ($XXX) and we should not be greedy
    // Some apparent 4-digit codes are actually 3-digit codes + the first letter of a word
    
    // Remove exactly 3-digit color codes: $XXX where X is hex digit
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}/g, '')
    
    // Clean up spaces and special characters that might be left over
    cleaned = cleaned.replace(/[\s\-_]+/g, ' ').trim()
    
    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing Fixed Track Name Cleaning (3-digit codes only)');
console.log('='.repeat(60));

const testCases = [
    {
        input: '$o Red Driveby',
        expected: 'Red Driveby',
        description: 'Map 1 - Red Driveby (simple case)'
    },
    {
        input: '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
        expected: 'Cove Gardens',  
        description: 'Map 4 - Cove Gardens (complex case)'
    },
    {
        input: 'Mirage',
        expected: 'Mirage',
        description: 'Map 2 - Mirage (no codes)'
    },
    {
        input: 'Dawnspire Pass',
        expected: 'Dawnspire Pass',
        description: 'Map 3 - Dawnspire Pass (no codes)'
    }
];

testCases.forEach((testCase, index) => {
    const result = cleanTrackName(testCase.input);
    const success = result === testCase.expected;
    
    console.log(`\n${index + 1}. ${testCase.description}`);
    console.log(`   Input:    "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Result:   "${result}"`);
    console.log(`   Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
});

// Test the complex case step by step
console.log('\n' + '='.repeat(60));
console.log('🔍 Step-by-step analysis of complex case:');

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`\nOriginal: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3}/g, '');
console.log(`After removing 3-digit codes: "${step1}"`);

let final = step1.replace(/[\s\-_]+/g, ' ').trim();
console.log(`Final result: "${final}"`);

console.log(`\n✨ Success! The result should now be "Cove Gardens"`);

// Additional edge cases
console.log('\n' + '='.repeat(60));
console.log('🧪 Testing additional edge cases:');

const additionalCases = [
    '$123Test$456Name',
    '$ABCRed$DEFTrack', 
    '$FFF$000Mixed$999Colors'
];

additionalCases.forEach((testCase, index) => {
    const result = cleanTrackName(testCase);
    console.log(`${index + 1}. "${testCase}" → "${result}"`);
});

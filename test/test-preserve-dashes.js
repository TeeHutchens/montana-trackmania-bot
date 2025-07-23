// Test the corrected track name cleaning that preserves dashes
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes
    // Based on analysis, Trackmania uses 3-digit color codes ($XXX)
    // Some apparent 4-digit codes are actually 3-digit + text
    
    // Remove all $ followed by exactly 3 hex digits
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}/g, '')
    
    // Handle malformed codes like $o (single character after $)
    cleaned = cleaned.replace(/\$[a-zA-Z0-9]/g, '')
    
    // Clean up multiple spaces but preserve dashes
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing Corrected Track Name Cleaning (preserving dashes)');
console.log('='.repeat(60));

const testCases = [
    {
        input: '$o Red Driveby',
        expected: 'Red Driveby',
        description: 'Map 1 - Red Driveby'
    },
    {
        input: '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
        expected: '4 - Cove Gardens',
        description: 'Map 4 - Cove Gardens (complex case)'
    },
    {
        input: 'Mirage',
        expected: 'Mirage',
        description: 'Map 2 - Mirage'
    },
    {
        input: 'Dawnspire Pass',
        expected: 'Dawnspire Pass',
        description: 'Map 3 - Dawnspire Pass'
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
console.log('🔍 Step-by-step analysis:');

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`\nOriginal: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3}/g, '');
console.log(`After removing 3-digit codes: "${step1}"`);

let step2 = step1.replace(/\$[a-zA-Z0-9]/g, '');
console.log(`After removing malformed codes: "${step2}"`);

let final = step2.replace(/\s+/g, ' ').trim();
console.log(`Final (preserve dashes): "${final}"`);

console.log(`\nExpected: "4 - Cove Gardens"`);
console.log(`Match: ${final === '4 - Cove Gardens' ? '✅' : '❌'}`);

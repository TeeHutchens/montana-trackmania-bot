// Final test of the track name cleaning
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes
    // Color codes are exactly 3 hex digits: $XXX where X is 0-9, A-F, a-f
    // Some cases might have 4 digits where the 4th is actually part of the word
    
    // First, handle the case where we have $XXXX and the 4th digit might be part of text
    // Remove $XXX at word boundaries or followed by non-hex characters
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, '')
    
    // Then remove any remaining 3-digit color codes that are embedded
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}/g, '')
    
    // Handle malformed codes like $o (single character after $)
    cleaned = cleaned.replace(/\$[a-zA-Z0-9]/g, '')
    
    // Clean up spaces and special characters that might be left over
    cleaned = cleaned.replace(/[\s\-_]+/g, ' ').trim()
    
    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Final Test of Track Name Cleaning');
console.log('='.repeat(50));

const testCases = [
    {
        input: '$o Red Driveby',
        expected: 'Red Driveby',
        description: 'Map 1 - Red Driveby'
    },
    {
        input: '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
        expected: 'Cove Gardens',
        description: 'Map 4 - Cove Gardens'
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

// Test the complex case step by step to debug
console.log('\n' + '='.repeat(50));
console.log('🔍 Debugging the complex case:');

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`\nOriginal: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, '');
console.log(`Step 1 (boundary codes): "${step1}"`);

let step2 = step1.replace(/\$[0-9A-Fa-f]{3}/g, '');
console.log(`Step 2 (remaining codes): "${step2}"`);

let step3 = step2.replace(/\$[a-zA-Z0-9]/g, '');
console.log(`Step 3 (malformed codes): "${step3}"`);

let final = step3.replace(/[\s\-_]+/g, ' ').trim();
console.log(`Final: "${final}"`);

console.log(`\nShould be: "Cove Gardens"`);
console.log(`Match: ${final === 'Cove Gardens' ? '✅' : '❌'}`);

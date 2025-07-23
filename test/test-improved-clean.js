// Test the improved track name cleaning
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes more precisely
    // Trackmania uses $XXX or $XXXX format where X is a hex digit (0-9, A-F, a-f)
    // We need to be careful not to remove legitimate text
    
    // Pattern 1: Remove standard color codes $XXX (3 hex digits)
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, '')
    
    // Pattern 2: Remove extended color codes $XXXX (4 hex digits) 
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{4}/g, '')
    
    // Pattern 3: Handle edge cases like $o, $z (single characters that might be malformed codes)
    // But be more conservative - only remove if followed by space or at word boundaries
    cleaned = cleaned.replace(/\$[a-zA-Z0-9](?=\s|$)/g, '')
    
    // Clean up multiple spaces, leading/trailing spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing Improved Track Name Cleaning');
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
        description: 'Map 4 - Cove Gardens (complex case)'
    },
    {
        input: 'Mirage',
        expected: 'Mirage',
        description: 'Map 2 - Simple case (Mirage)'
    },
    {
        input: 'Dawnspire Pass',
        expected: 'Dawnspire Pass',
        description: 'Map 3 - Simple case (Dawnspire Pass)'
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

console.log('\n' + '='.repeat(50));
console.log('🔍 Analyzing the complex case step by step:');

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`\nOriginal: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, '');
console.log(`Step 1 (remove 3-digit codes): "${step1}"`);

let step2 = step1.replace(/\$[0-9A-Fa-f]{4}/g, '');
console.log(`Step 2 (remove 4-digit codes): "${step2}"`);

let step3 = step2.replace(/\$[a-zA-Z0-9](?=\s|$)/g, '');
console.log(`Step 3 (remove single chars): "${step3}"`);

let final = step3.replace(/\s+/g, ' ').trim();
console.log(`Final (cleanup spaces): "${final}"`);

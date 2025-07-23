// Test the improved regex with hypothetical raw data that would produce the observed results
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes more aggressively
    // Handle complex cases like: $6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns
    // Should become: 4 - Cove Gardens
    
    // First, remove all $ followed by 3 or 4 hex digits
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3,4}/g, '')
    
    // Remove any remaining $ followed by single characters (malformed codes)
    cleaned = cleaned.replace(/\$[a-zA-Z0-9]/g, '')
    
    // Clean up multiple spaces and normalize spacing around dashes
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()
    
    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing Improved Track Name Regex with Raw Data');
console.log('='.repeat(60));

// These would be the hypothetical raw data patterns that could produce the observed Discord output
const rawDataTests = [
    {
        input: '$123 1$456 -$789 $o Re$ABCd$DEF Driveby',
        expected: '1 - Red Driveby',
        description: 'Raw data for Map 1'
    },
    {
        input: '$111 2$222 $333-$444 $oMi$555ra$666ge',
        expected: '2 - Mirage', 
        description: 'Raw data for Map 2'
    },
    {
        input: '$789 3$ABC -$DEF D$123aw$456n$789spire Pass',
        expected: '3 - Dawnspire Pass',
        description: 'Raw data for Map 3'
    },
    {
        input: '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
        expected: '4 - Cove Gardens',
        description: 'Raw data for Map 4 (known case)'
    },
    {
        input: '$123 5$456 -$789 Pluto',
        expected: '5 - Pluto',
        description: 'Raw data for Map 5'
    }
];

rawDataTests.forEach((testCase, index) => {
    const result = cleanTrackName(testCase.input);
    const success = result === testCase.expected;
    
    console.log(`\n${index + 1}. ${testCase.description}`);
    console.log(`   Raw Input: "${testCase.input}"`);
    console.log(`   Expected:  "${testCase.expected}"`);
    console.log(`   Result:    "${result}"`);
    console.log(`   Status:    ${success ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(60));
console.log('🔍 Testing the known complex case step by step:');

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`\nRaw: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3,4}/g, '');
console.log(`After removing 3-4 digit codes: "${step1}"`);

let step2 = step1.replace(/\$[a-zA-Z0-9]/g, '');
console.log(`After removing malformed codes: "${step2}"`);

let step3 = step2.replace(/\s+/g, ' ');
console.log(`After normalizing spaces: "${step3}"`);

let final = step3.replace(/\s*-\s*/g, ' - ').trim();
console.log(`Final (normalize dashes): "${final}"`);

console.log(`\nShould be: "4 - Cove Gardens"`);
console.log(`Success: ${final === '4 - Cove Gardens' ? '✅' : '❌'}`);

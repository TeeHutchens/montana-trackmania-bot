// Test with the specific real map names you mentioned
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove standard Trackmania color codes: $XXX (3 hex digits) and $XXXX (4 hex digits)
    // But be more careful about what we consider hex digits vs. actual letters
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3,4}/g, '')
    
    // Remove any remaining single character codes like $o, $z, etc.
    cleaned = cleaned.replace(/\$[0-9A-Za-z]/g, '')
    
    // Clean up spaces, dashes, and normalize
    cleaned = cleaned.replace(/[\s\-]+/g, ' ').trim()
    
    if (!cleaned) {
        return 'Unknown Track'
    }
    
    return cleaned
}

// Test the specific cases you mentioned
console.log('🧪 Testing Real Map Names');
console.log('='.repeat(50));

const realMapCases = [
    {
        input: '$o Red Driveby',
        expected: 'Red Driveby',
        mapNumber: '1'
    },
    {
        input: '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
        expected: 'Cove Gardens',
        mapNumber: '4'
    },
    // Let me also test what might be the other maps
    {
        input: 'Mirage', // assuming this is clean
        expected: 'Mirage', 
        mapNumber: '2'
    },
    {
        input: 'Dawnspire Pass', // assuming this is clean
        expected: 'Dawnspire Pass',
        mapNumber: '3'
    }
];

realMapCases.forEach((testCase) => {
    const result = cleanTrackName(testCase.input);
    const success = result === testCase.expected;
    
    console.log(`Map ${testCase.mapNumber}:`);
    console.log(`  Input:    "${testCase.input}"`);
    console.log(`  Expected: "${testCase.expected}"`);
    console.log(`  Result:   "${result}"`);
    console.log(`  Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
});

// Let's also do a step-by-step analysis of the complex case
console.log('🔍 Step-by-step analysis of complex case:');
console.log('─'.repeat(50));

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`Original: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3,4}/g, '');
console.log(`After removing $XXX/$XXXX: "${step1}"`);

let step2 = step1.replace(/\$[0-9A-Za-z]/g, '');
console.log(`After removing $X: "${step2}"`);

let step3 = step2.replace(/[\s\-]+/g, ' ').trim();
console.log(`After cleanup: "${step3}"`);

// Let me also try a character-by-character approach to understand the structure
console.log('\n🔤 Character analysis:');
console.log('─'.repeat(30));
for (let i = 0; i < complexCase.length; i++) {
    const char = complexCase[i];
    const remaining = complexCase.slice(i);
    if (char === '$') {
        // Check what follows the $
        const next4 = remaining.slice(0, 5); // $XXXX
        const next3 = remaining.slice(0, 4); // $XXX
        console.log(`Position ${i}: "${next4}" or "${next3}"`);
    }
}

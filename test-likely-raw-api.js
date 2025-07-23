function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes systematically
    // Strategy: Remove all $ followed by up to 3 characters that might be color codes
    
    // Remove any $ followed by 1-3 alphanumeric characters (covers all possible malformed codes)
    cleaned = cleaned.replace(/\$[0-9A-Za-z]{1,3}/g, '')
    
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

console.log('🧪 Testing with Likely Raw API Data');
console.log('='.repeat(60));

// These are what the raw API data likely looks like based on Trackmania color code format
const likelyRawData = [
    {
        input: '$f00Red $fffDriveby',
        expected: 'Red Driveby',
        description: 'Map 1 - Likely raw API format'
    },
    {
        input: '$o50Mi$fffrage',
        expected: 'Mirage',
        description: 'Map 2 - Likely raw API format'
    },
    {
        input: '$888Dawn$fffspire $aabPass',
        expected: 'Dawnspire Pass',
        description: 'Map 3 - Likely raw API format'
    },
    {
        input: '$5a5Cove $f80Gar$fffdens',
        expected: 'Cove Gardens',
        description: 'Map 4 - Likely raw API format'
    },
    {
        input: '1 - $f00Red $fffDriveby',
        expected: '1 - Red Driveby',
        description: 'With track number prefix'
    }
];

likelyRawData.forEach((testCase, index) => {
    const result = cleanTrackName(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`\nTest ${index + 1}: ${testCase.description}`);
    console.log(`Input:    "${testCase.input}"`);
    console.log(`Expected: "${testCase.expected}"`);
    console.log(`Got:      "${result}"`);
    console.log(`Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(60));
console.log('🔍 Analysis: If these tests pass, the regex is working correctly');
console.log('💡 The issue might be that we\'re seeing already processed/corrupted data');
console.log('🚨 We need to check what the actual raw API responses look like');

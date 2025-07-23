// Simple test for the track name cleaning fix
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    // Remove Trackmania color codes: $XXX or $XXXX where X is hex digit
    let cleaned = name
    
    // Remove all Trackmania color codes with more comprehensive patterns
    // Pattern 1: $XXX or $XXXX (3 or 4 hex digits)
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3,4}/g, '')
    
    // Pattern 2: Handle cases where partial codes like $o might appear (single letter after $)
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]/g, '')
    
    // Pattern 3: Remove any remaining $ followed by single characters that might be malformed codes
    cleaned = cleaned.replace(/\$[a-zA-Z0-9]/g, '')
    
    // Clean up multiple spaces, leading/trailing spaces, and normalize
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // If the result is empty, return Unknown Track
    if (!cleaned) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing Track Name Cleaning Fix');
console.log('='.repeat(40));

// Test the specific issue case
const testCases = [
    '$o Red Driveby',
    '$oRed Driveby', 
    '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
    'Normal Track Name',
    '$FFFRed Track',
    '$123$456Blue Mountain'
];

testCases.forEach((testCase, index) => {
    const result = cleanTrackName(testCase);
    console.log(`${index + 1}. Input:  "${testCase}"`);
    console.log(`   Output: "${result}"`);
    console.log('');
});

console.log('✅ Testing complete!');

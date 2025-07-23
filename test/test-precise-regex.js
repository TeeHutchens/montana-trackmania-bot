// Test the precise 3-digit only regex
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove exactly 3-digit color codes: $XXX
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, '')
    
    // Remove any remaining $ followed by single characters (malformed codes like $o)
    cleaned = cleaned.replace(/\$[a-zA-Z0-9]/g, '')
    
    // Clean up multiple spaces and normalize spacing around dashes
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()
    
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing Precise 3-Digit Color Code Removal');
console.log('='.repeat(60));

// Test the known complex case
const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`\nTesting: "${complexCase}"`);
console.log('Expected: "4 - Cove Gardens"');

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, '');
console.log(`After 3-digit removal: "${step1}"`);

let step2 = step1.replace(/\$[a-zA-Z0-9]/g, '');
console.log(`After malformed removal: "${step2}"`);

let step3 = step2.replace(/\s+/g, ' ');
console.log(`After space cleanup: "${step3}"`);

let final = step3.replace(/\s*-\s*/g, ' - ').trim();
console.log(`Final result: "${final}"`);

const result = cleanTrackName(complexCase);
console.log(`\nFunction result: "${result}"`);
console.log(`Success: ${result === '4 - Cove Gardens' ? '✅' : '❌'}`);

// Let me also test some other patterns
console.log('\n' + '='.repeat(60));
console.log('🔍 Testing other patterns:');

const testCases = [
    '$o Red Driveby',
    '$oMirage', 
    '1$ABC - $DEFRed Driveby',
    '2$123 - $456Mirage'
];

testCases.forEach((test, index) => {
    const result = cleanTrackName(test);
    console.log(`${index + 1}. "${test}" → "${result}"`);
});

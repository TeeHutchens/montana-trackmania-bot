// Test the ordered approach: 4-digit first, then 3-digit
function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove 4-digit color codes: $XXXX (but only if they're complete 4-digit codes)
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{4}(?=\s|$|[^0-9A-Fa-f])/g, '')
    
    // Remove 3-digit color codes: $XXX  
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}/g, '')
    
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

console.log('🧪 Testing Ordered Color Code Removal (4-digit first, then 3-digit)');
console.log('='.repeat(70));

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
console.log(`\nTesting: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{4}(?=\s|$|[^0-9A-Fa-f])/g, '');
console.log(`After 4-digit removal: "${step1}"`);

let step2 = step1.replace(/\$[0-9A-Fa-f]{3}/g, '');
console.log(`After 3-digit removal: "${step2}"`);

let step3 = step2.replace(/\$[a-zA-Z0-9]/g, '');
console.log(`After malformed removal: "${step3}"`);

let step4 = step3.replace(/\s+/g, ' ');
console.log(`After space cleanup: "${step4}"`);

let final = step4.replace(/\s*-\s*/g, ' - ').trim();
console.log(`Final result: "${final}"`);

const result = cleanTrackName(complexCase);
console.log(`\nFunction result: "${result}"`);
console.log(`Expected: "4 - Cove Gardens"`);
console.log(`Success: ${result === '4 - Cove Gardens' ? '✅' : '❌'}`);

// Test other cases
console.log('\n' + '='.repeat(70));
console.log('🔍 Testing other patterns:');

const testCases = [
    {input: '$o Red Driveby', expected: 'Red Driveby'},
    {input: '$oMirage', expected: 'Mirage'},
    {input: '1$ABC - $DEFRed Driveby', expected: '1 - Red Driveby'},
    {input: '2$123 - $456Mirage', expected: '2 - Mirage'}
];

testCases.forEach((test, index) => {
    const result = cleanTrackName(test.input);
    const success = result === test.expected;
    console.log(`${index + 1}. "${test.input}" → "${result}" ${success ? '✅' : '❌'}`);
});

function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Strategy: Remove codes in a specific order to avoid eating legitimate letters
    // Pattern analysis:
    // "1 - $o$F90R$F60e$F30d $FFFDriveby" has letters R,e,d mixed with codes
    // "2 - $oM$eeei$cccr$6afa$3afg$0afe" has letters M,i,r,a,g,e mixed with codes
    
    // First, remove the obvious 4-character color codes
    cleaned = cleaned.replace(/\$[a-z]{4}/g, ''); // Remove things like $eeei, $cccr
    cleaned = cleaned.replace(/\$[0-9a-f]{4}/g, ''); // Remove things like $6afa, $3afg, $0afe
    
    // Then remove 3-digit hex codes 
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}/g, ''); // $F90, $F60, $F30, $FFF
    
    // Finally remove single character reset codes
    cleaned = cleaned.replace(/\$o/g, ''); // Remove reset codes
    
    // Clean up multiple spaces and normalize spacing around dashes
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()
    
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing with ACTUAL API data patterns');
console.log('='.repeat(60));

const actualAPITests = [
    {
        input: '1 - $o$F90R$F60e$F30d $FFFDriveby',
        expected: '1 - Red Driveby',
        description: 'Map 1 - Actual API response'
    },
    {
        input: '2 - $oM$eeei$cccr$6afa$3afg$0afe',
        expected: '2 - Mirage',
        description: 'Map 2 - Actual API response'
    }
];

actualAPITests.forEach((test, index) => {
    console.log(`\n--- Test ${index + 1}: ${test.description} ---`);
    console.log(`Input:    "${test.input}"`);
    console.log(`Expected: "${test.expected}"`);
    
    // Step by step debugging
    let step1 = test.input.replace(/\$[a-z]{4}/g, '');
    console.log(`Step 1 (remove 4-char lowercase): "${step1}"`);
    
    let step2 = step1.replace(/\$[0-9a-f]{4}/g, '');
    console.log(`Step 2 (remove 4-char hex): "${step2}"`);
    
    let step3 = step2.replace(/\$[0-9A-Fa-f]{3}/g, '');
    console.log(`Step 3 (remove 3-digit hex): "${step3}"`);
    
    let step4 = step3.replace(/\$o/g, '');
    console.log(`Step 4 (remove reset codes): "${step4}"`);
    
    let final = step4.replace(/\s+/g, ' ').replace(/\s*-\s*/g, ' - ').trim();
    console.log(`Final result: "${final}"`);
    
    const success = final === test.expected;
    console.log(`Status: ${success ? '✅ PASS' : '❌ FAIL'}`);
});

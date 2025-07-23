function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Trackmania encodes colored letters as the last character of color codes
    // Example: "$F90R$F60e$F30d" means Red (R, e, d are the last chars)
    // We need to extract these letters and remove the color codes
    
    // First, handle the complex encoded sections
    cleaned = cleaned.replace(/(\$[0-9A-Fa-f]{3}[A-Za-z])+/g, (match) => {
        // Extract letters from codes like $F90R$F60e$F30d
        const letters = match.match(/\$[0-9A-Fa-f]{3}([A-Za-z])/g);
        if (letters) {
            return letters.map(code => code.slice(-1)).join('');
        }
        return '';
    });
    
    // Handle mixed patterns like $oM$eeei$cccr$6afa$3afg$0afe
    cleaned = cleaned.replace(/(\$[0-9a-zA-Z]+)+/g, (match) => {
        // Look for patterns where letters are at the end of codes
        const codes = match.match(/\$[0-9a-zA-Z]+/g);
        if (codes) {
            const letters = codes
                .filter(code => /[A-Za-z]$/.test(code)) // Only codes ending with letters
                .map(code => code.slice(-1)); // Get the last character
            return letters.join('');
        }
        return '';
    });
    
    // Remove any remaining $ codes
    cleaned = cleaned.replace(/\$[0-9A-Za-z]+/g, '');
    
    // Clean up multiple spaces and normalize spacing around dashes
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()
    
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🎯 Testing Letter Extraction from Color Codes');
console.log('='.repeat(60));

const tests = [
    {
        input: '1 - $o$F90R$F60e$F30d $FFFDriveby',
        expected: '1 - Red Driveby',
        description: 'Map 1 - Letters as last chars of hex codes'
    },
    {
        input: '2 - $oM$eeei$cccr$6afa$3afg$0afe',
        expected: '2 - Mirage',
        description: 'Map 2 - Letters as last chars of mixed codes'
    }
];

tests.forEach((test, index) => {
    console.log(`\n--- Test ${index + 1}: ${test.description} ---`);
    console.log(`Input:    "${test.input}"`);
    console.log(`Expected: "${test.expected}"`);
    
    const result = cleanTrackName(test.input);
    console.log(`Result:   "${result}"`);
    
    const success = result === test.expected;
    console.log(`Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
});

function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Trackmania encodes colored letters in a specific way:
    // - $o is a reset code (ignore)
    // - $XXXy means color XXX + letter y 
    // - $FFFword means color FFF + word "word"
    
    // Strategy: Process each $ code individually
    cleaned = cleaned.replace(/\$[0-9A-Za-z]+/g, (match) => {
        // Skip reset codes
        if (match === '$o') return '';
        
        // Check if it's a 3-digit hex code + single letter
        if (/^\$[0-9A-Fa-f]{3}[A-Za-z]$/.test(match)) {
            return match.slice(-1); // Return the letter
        }
        
        // Check if it's a 4-character code ending with a letter
        if (/^\$[0-9a-zA-Z]{3}[A-Za-z]$/.test(match)) {
            return match.slice(-1); // Return the letter
        }
        
        // Check if it's $o + letter (like $oM)
        if (/^\$o[A-Za-z]$/.test(match)) {
            return match.slice(-1); // Return the letter
        }
        
        // If it's longer, it might be a color code + word (like $FFFDriveby)
        if (match.length > 4) {
            // Look for pattern: $XXX + word where XXX is 3 hex digits
            const hexMatch = match.match(/^\$([0-9A-Fa-f]{3})(.+)$/);
            if (hexMatch) {
                return hexMatch[2]; // Return the word part
            }
        }
        
        // Default: remove the code
        return '';
    });
    
    // Clean up spacing
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()
    
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🎯 Testing Precise Color Code Processing');
console.log('='.repeat(60));

const tests = [
    {
        input: '1 - $o$F90R$F60e$F30d $FFFDriveby',
        expected: '1 - Red Driveby',
        description: 'Pattern 1: 3-digit hex + letters, plus color + word'
    },
    {
        input: '2 - $oM$eeei$cccr$6afa$3afg$0afe',
        expected: '2 - Mirage', 
        description: 'Pattern 2: Various 4-char codes ending with letters'
    }
];

tests.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: ${test.description}`);
    console.log(`Input:    "${test.input}"`);
    console.log(`Expected: "${test.expected}"`);
    
    const result = cleanTrackName(test.input);
    console.log(`Result:   "${result}"`);
    
    const success = result === test.expected;
    console.log(`Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
});

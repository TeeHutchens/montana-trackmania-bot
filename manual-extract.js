function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Trackmania color encoding strategy:
    // 1. Extract letters from 3-digit hex codes followed by letters: $F90R → R
    // 2. Extract letters from other codes that end with letters: $eeei → i
    // 3. Remove remaining $ codes
    
    // Step 1: Handle 3-digit hex + letter patterns
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}[A-Za-z]/g, (match) => {
        return match.slice(-1); // Keep just the letter
    });
    
    // Step 2: Handle other $ codes that end with letters (but not hex+letter already processed)
    cleaned = cleaned.replace(/\$[^0-9A-Fa-f\s][0-9a-zA-Z]*[A-Za-z]/g, (match) => {
        return match.slice(-1); // Keep just the last letter
    });
    
    cleaned = cleaned.replace(/\$[0-9a-zA-Z]{4}[A-Za-z]/g, (match) => {
        return match.slice(-1); // Keep just the last letter
    });
    
    // Step 3: Remove all remaining $ codes
    cleaned = cleaned.replace(/\$[0-9A-Za-z]+/g, '');
    
    // Clean up spacing
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()
    
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

// Test with a more manual approach first
function manualExtract(input) {
    console.log(`\nManual extraction for: "${input}"`);
    
    // Find all $ patterns and their positions
    const codes = input.match(/\$[0-9A-Za-z]+/g);
    console.log('Found codes:', codes);
    
    if (codes) {
        codes.forEach(code => {
            console.log(`  Code: "${code}" → last char: "${code.slice(-1)}"`);
        });
    }
}

manualExtract('1 - $o$F90R$F60e$F30d $FFFDriveby');
manualExtract('2 - $oM$eeei$cccr$6afa$3afg$0afe');

console.log('\n' + '='.repeat(50));

// Test the function
console.log('Testing cleanTrackName:');
console.log('Input 1:', cleanTrackName('1 - $o$F90R$F60e$F30d $FFFDriveby'));
console.log('Input 2:', cleanTrackName('2 - $oM$eeei$cccr$6afa$3afg$0afe'));

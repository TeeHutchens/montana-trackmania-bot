function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Trackmania color encoding: letters are last characters of $ codes
    // Strategy: Find all $ codes and extract letters from them
    
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3}[A-Za-z]/g, (match) => {
        // Extract letter from codes like $F90R, $F60e, $F30d
        return match.slice(-1); // Return just the last character (the letter)
    });
    
    // Handle codes that end with letters (like $oM, $eeei becomes i, etc.)
    cleaned = cleaned.replace(/\$[0-9a-zA-Z]*[A-Za-z]/g, (match) => {
        // Return the last character if it's a letter
        const lastChar = match.slice(-1);
        return /[A-Za-z]/.test(lastChar) ? lastChar : '';
    });
    
    // Remove any remaining $ codes that don't end with letters
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

// Debug step by step
function debugClean(input) {
    console.log(`\nDebugging: "${input}"`);
    
    let step1 = input.replace(/\$[0-9A-Fa-f]{3}[A-Za-z]/g, (match) => {
        console.log(`  Match 3-digit+letter: "${match}" → "${match.slice(-1)}"`);
        return match.slice(-1);
    });
    console.log(`Step 1: "${step1}"`);
    
    let step2 = step1.replace(/\$[0-9a-zA-Z]*[A-Za-z]/g, (match) => {
        const lastChar = match.slice(-1);
        console.log(`  Match code+letter: "${match}" → "${lastChar}"`);
        return /[A-Za-z]/.test(lastChar) ? lastChar : '';
    });
    console.log(`Step 2: "${step2}"`);
    
    let step3 = step2.replace(/\$[0-9A-Za-z]+/g, '');
    console.log(`Step 3: "${step3}"`);
    
    let final = step3.replace(/\s+/g, ' ').replace(/\s*-\s*/g, ' - ').trim();
    console.log(`Final: "${final}"`);
    
    return final;
}

debugClean('1 - $o$F90R$F60e$F30d $FFFDriveby');
debugClean('2 - $oM$eeei$cccr$6afa$3afg$0afe');

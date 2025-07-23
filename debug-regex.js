function cleanTrackNameDebug(name) {
    if (!name) return 'Unknown Track'
    
    console.log(`🔍 Debugging: "${name}"`);
    let cleaned = name
    
    // Step 1: Try to remove $ + 1-3 alphanumeric
    const step1 = cleaned.replace(/\$[0-9A-Za-z]{1,3}/g, '');
    console.log(`   Step 1 (/\\$[0-9A-Za-z]{1,3}/g): "${step1}"`);
    
    // Let's see what the regex is actually matching
    const matches = name.match(/\$[0-9A-Za-z]{1,3}/g);
    console.log(`   Matches found:`, matches);
    
    cleaned = step1;
    
    // Clean up multiple spaces and normalize spacing around dashes
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\s*-\s*/g, ' - ')
    cleaned = cleaned.trim()
    
    console.log(`   Final result: "${cleaned}"`);
    
    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🐛 Debugging the problematic case:');
cleanTrackNameDebug('$o50Mi$fffrage');

function debugSingleChars(name) {
    console.log(`🔍 Debugging: "${name}"`);
    let cleaned = name;
    
    // Step 1: Remove 3-char codes
    const matches3 = cleaned.match(/\$[0-9A-Za-z]{3}/g);
    console.log(`   3-char matches:`, matches3);
    cleaned = cleaned.replace(/\$[0-9A-Za-z]{3}/g, '');
    console.log(`   After 3-char removal: "${cleaned}"`);
    
    // Step 2: Remove 1-2 char codes  
    const matches12 = cleaned.match(/\$[0-9A-Za-z]{1,2}/g);
    console.log(`   1-2 char matches:`, matches12);
    cleaned = cleaned.replace(/\$[0-9A-Za-z]{1,2}/g, '');
    console.log(`   After 1-2 char removal: "${cleaned}"`);
    
    return cleaned;
}

debugSingleChars('$a$b$c$dClean');

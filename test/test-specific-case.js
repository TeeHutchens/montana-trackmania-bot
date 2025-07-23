// Let me test what happens if I treat $6C04 as a complete 4-digit code
function testSpecificCase() {
    const input = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';
    
    console.log('Testing specific manual replacements:');
    console.log(`Original: "${input}"`);
    
    // What if $6C04 is indeed a complete 4-digit color code?
    let test1 = input
        .replace(/\$6C04/g, '')  // Remove the specific 4-digit code
        .replace(/\$[0-9A-Fa-f]{3}/g, '')  // Remove all 3-digit codes
        .replace(/[\s\-_]+/g, ' ')
        .trim();
    
    console.log(`Manual approach: "${test1}"`);
    
    // Let me try a mixed approach - remove 4-digit codes that are standalone, then 3-digit
    let test2 = input
        .replace(/\$[0-9A-Fa-f]{4}(?=\s)/g, '')  // Remove 4-digit codes followed by space
        .replace(/\$[0-9A-Fa-f]{3}/g, '')        // Remove all 3-digit codes
        .replace(/[\s\-_]+/g, ' ')
        .trim();
    
    console.log(`Mixed approach: "${test2}"`);
    
    // What if I'm more aggressive with 4-digit codes?
    let test3 = input
        .replace(/\$[0-9A-Fa-f]{4}/g, '')  // Remove ALL 4-digit codes
        .replace(/\$[0-9A-Fa-f]{3}/g, '')  // Remove all 3-digit codes  
        .replace(/[\s\-_]+/g, ' ')
        .trim();
    
    console.log(`Aggressive approach: "${test3}"`);
}

testSpecificCase();

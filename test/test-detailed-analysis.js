// Detailed analysis of the complex color code case
function analyzeColorCodes(text) {
    console.log(`Analyzing: "${text}"`);
    console.log('Breaking down character by character:');
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '$') {
            // Look ahead to see the color code
            let colorCode = '$';
            let j = i + 1;
            while (j < text.length && /[0-9A-Fa-f]/.test(text[j])) {
                colorCode += text[j];
                j++;
            }
            console.log(`  Position ${i}: Color code "${colorCode}"`);
            i = j - 1; // Skip ahead
        } else {
            console.log(`  Position ${i}: Character "${char}"`);
        }
    }
}

function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    let cleaned = name
    
    // Remove Trackmania color codes
    // Trackmania color codes can be $XXX or $XXXX where X is hex digit
    // They can appear anywhere in the text, even within words
    
    // Remove all color codes: $followed by 3 or 4 hex digits
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3,4}/g, '')
    
    // Remove any remaining $ followed by single hex digits (edge cases)
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]/g, '')
    
    // Clean up spaces and special characters that might be left over
    cleaned = cleaned.replace(/[\s\-_]+/g, ' ').trim()
    
    // If the result is empty or just whitespace, return Unknown Track
    if (!cleaned || cleaned.length === 0) {
        return 'Unknown Track'
    }
    
    return cleaned
}

const complexCase = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns';

// First, let's break down the complex case
analyzeColorCodes(complexCase);

console.log('\n' + '='.repeat(60));
console.log('Testing the cleaning function:');

// Test step by step
console.log(`\nOriginal: "${complexCase}"`);

let step1 = complexCase.replace(/\$[0-9A-Fa-f]{3,4}/g, '');
console.log(`After removing color codes: "${step1}"`);

let step2 = step1.replace(/\$[0-9A-Fa-f]/g, '');
console.log(`After removing single hex: "${step2}"`);

let final = step2.replace(/[\s\-_]+/g, ' ').trim();
console.log(`Final result: "${final}"`);

// Expected: "Cove Gardens"
console.log(`Expected: "Cove Gardens"`);
console.log(`Match: ${final === 'Cove Gardens' ? '✅' : '❌'}`);

// Let me try a different approach - maybe the issue is that some codes split across what should be words
console.log('\n' + '='.repeat(60));
console.log('Alternative approach - manual reconstruction:');

// Looking at: $6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns
// If I remove ALL $+hex sequences, I should get: " - ove  Grens"
// But maybe it should be parsed as: "Co" + "ve" + " G" + "ar" + "de" + "ns" = "Cove Gardens"

// Let me try to identify the pattern manually
const manual = complexCase
    .replace(/\$6C04/g, '')  // Remove $6C04
    .replace(/\$7D0/g, '')   // Remove $7D0
    .replace(/\$8E0/g, '')   // Remove $8E0
    .replace(/\$9F0/g, '')   // Remove $9F0 (appears twice)
    .replace(/\$AE0/g, '')   // Remove $AE0
    .replace(/\$BD0/g, '')   // Remove $BD0
    .replace(/\$CC0/g, '')   // Remove $CC0
    .replace(/[\s\-_]+/g, ' ')
    .trim();

console.log(`Manual approach result: "${manual}"`);

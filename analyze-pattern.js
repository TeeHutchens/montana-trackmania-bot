// Let's analyze the patterns more carefully
function analyzePattern(input, expected) {
    console.log(`\nAnalyzing: "${input}" → should be "${expected}"`);
    
    // Let's try removing everything that starts with $
    let withoutDollar = input.replace(/\$[^\s$]*(?=\$|$|\s)/g, '');
    console.log(`Remove all $-codes: "${withoutDollar}"`);
    
    // Let's see if we can identify the pattern
    let chars = [];
    let i = 0;
    while (i < input.length) {
        if (input[i] === '$') {
            // Skip the $ and find the next $ or space or end
            let j = i + 1;
            while (j < input.length && input[j] !== '$' && input[j] !== ' ') {
                j++;
            }
            let code = input.substring(i, j);
            console.log(`   Found code: "${code}"`);
            i = j;
        } else {
            chars.push(input[i]);
            console.log(`   Found char: "${input[i]}"`);
            i++;
        }
    }
    console.log(`   Extracted chars: "${chars.join('')}"`);
}

// Analyze both patterns
analyzePattern('1 - $o$F90R$F60e$F30d $FFFDriveby', '1 - Red Driveby');
analyzePattern('2 - $oM$eeei$cccr$6afa$3afg$0afe', '2 - Mirage');

// Maybe the letters are the last character of certain codes?
console.log('\n--- Alternative analysis ---');
console.log('Pattern 1: $o$F90R$F60e$F30d → R, e, d (last chars)');
console.log('Pattern 2: $oM$eeei$cccr$6afa$3afg$0afe → M, i, r, a, g, e (last chars)');

// Analyze the actual color codes in the problem track name

const problemName = '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns'
console.log('Original name:', problemName)
console.log('Length:', problemName.length)
console.log('Characters:')

for (let i = 0; i < problemName.length; i++) {
    const char = problemName[i]
    const code = char.charCodeAt(0)
    console.log(`${i}: "${char}" (${code})`)
}

console.log('\nLet me try a different approach...')

// More precise regex that looks for the specific pattern
function betterCleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    // This regex looks for $ followed by exactly 3-4 hex digits, optionally followed by a dash and space
    let cleaned = name.replace(/\$[0-9A-Fa-f]{3,4}[-\s]*/g, '')
    
    // Clean up any remaining standalone $ symbols
    cleaned = cleaned.replace(/\$/g, '')
    
    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    return cleaned || 'Unknown Track'
}

console.log('Better cleaned:', betterCleanTrackName(problemName))

// Let's also try manually identifying the patterns
console.log('\nManual pattern analysis:')
const patterns = problemName.match(/\$[0-9A-Fa-f]{3,4}[-\s]*/g)
console.log('Found patterns:', patterns)

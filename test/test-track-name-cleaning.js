// Test the track name cleaning function

function cleanTrackName(name) {
    if (!name) return 'Unknown Track'
    
    // Remove Trackmania color codes: $XXX or $XXXX where X is hex digit
    let cleaned = name
    
    // First pass: remove color codes that are followed by space or dash
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3,4}[\s-]+/g, '')
    
    // Second pass: handle color codes attached to capital letters (word boundaries)
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3,4}(?=[A-Z])/g, ' ')
    
    // Third pass: remove remaining color codes
    cleaned = cleaned.replace(/\$[0-9A-Fa-f]{3,4}/g, '')
    
    // Clean up multiple spaces and trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // If the result is empty, return Unknown Track
    if (!cleaned) {
        return 'Unknown Track'
    }
    
    return cleaned
}

console.log('🧪 Testing track name cleaning...\n')

const testNames = [
    '$6C04 $7D0- $8E0Co$9F0ve$9F0 G$AE0ar$BD0de$CC0ns',
    '5 - Pluto',
    '$F00Red $0F0Green $00FBlue Track',
    'Normal Track Name',
    '$123Test$456Name$789',
    '',
    null,
    undefined
]

testNames.forEach((name, index) => {
    const cleaned = cleanTrackName(name)
    console.log(`${index + 1}. "${name}" → "${cleaned}"`)
})

console.log('\n✅ Track name cleaning test complete!')

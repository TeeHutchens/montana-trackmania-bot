const { recordPlacingFormatter, timeFormatter } = require('./helper/helper.js');

// Simulate the Montana player data (same as what we see in the logs)
const montanaData = new Map([
    ['Klint.TM', 4294967295],
    ['FrostyDogTM', 4294967295], 
    ['Tee.TM', 4294967295],
    ['ROCKRIVER12', 4294967295],
    ['STRGrim', 4294967295]
]);

console.log('🧪 Testing recordPlacingFormatter...');
console.log('Input data:', montanaData);

console.log('\n📋 Testing timeFormatter with No Time value:');
console.log('timeFormatter(4294967295):', timeFormatter(4294967295));

console.log('\n📋 Testing recordPlacingFormatter:');
const result = recordPlacingFormatter(montanaData);
console.log('Result:', result);
console.log('Result type:', typeof result);
console.log('Result length:', result ? result.length : 'null/undefined');

if (result) {
    console.log('\n✅ SUCCESS! Formatted leaderboard:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(result);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
} else {
    console.log('\n❌ PROBLEM: recordPlacingFormatter returned null/undefined');
}

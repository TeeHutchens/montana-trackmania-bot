const { timeFormatter } = require('../helper/helper.js');

console.log('🧪 Testing timeFormatter with various values...\n');

// Test the special "No Time" value
console.log('SECRET cases:');
console.log('timeFormatter(4294967295):', timeFormatter(4294967295));
console.log('timeFormatter(-1):', timeFormatter(-1));
console.log('timeFormatter(0):', timeFormatter(0));
console.log('timeFormatter(null):', timeFormatter(null));
console.log('timeFormatter(undefined):', timeFormatter(undefined));

console.log('\nReal time examples:');
// Test real Trackmania times (in milliseconds)
console.log('timeFormatter(35420):', timeFormatter(35420)); // Should be 35.420 seconds
console.log('timeFormatter(65789):', timeFormatter(65789)); // Should be 1:05.789
console.log('timeFormatter(125999):', timeFormatter(125999)); // Should be 2:05.999
console.log('timeFormatter(3600000):', timeFormatter(3600000)); // Should be 60:00.000

console.log('\nEdge cases:');
console.log('timeFormatter(123):', timeFormatter(123)); // Short time
console.log('timeFormatter(999999999):', timeFormatter(999999999)); // Very long value (should return SECRET)

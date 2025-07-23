require('dotenv').config();

console.log('Checking .env file credentials...');
console.log('UBI_USERNAME:', process.env.UBI_USERNAME ? 'SET' : 'NOT SET');
console.log('UBI_PASSWORD:', process.env.UBI_PASSWORD ? 'SET' : 'NOT SET');

if (process.env.UBI_USERNAME) {
    console.log('Username length:', process.env.UBI_USERNAME.length);
    console.log('Username preview:', process.env.UBI_USERNAME.substring(0, 5) + '...');
}

if (process.env.UBI_PASSWORD) {
    console.log('Password length:', process.env.UBI_PASSWORD.length);
    console.log('Password preview:', process.env.UBI_PASSWORD.substring(0, 3) + '...');
}

const credentials = Buffer.from(process.env.UBI_USERNAME + ':' + process.env.UBI_PASSWORD).toString('base64');
console.log('Base64 credentials preview:', credentials.substring(0, 20) + '...');

console.log('\nTesting base64 decode to verify:');
const decoded = Buffer.from(credentials, 'base64').toString();
console.log('Decoded preview:', decoded.substring(0, 10) + '...');

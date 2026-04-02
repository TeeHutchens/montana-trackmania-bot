require('dotenv').config();
const { APILogin } = require('./functions/authentication.js');

async function testAuth() {
    console.log('Testing authentication...');
    console.log('Login:', process.env.NADEO_LOGIN);
    console.log('Password length:', process.env.NADEO_PASSWORD?.length);

    try {
        const APICredentials = await APILogin();
        console.log('\n✅ All authentication steps successful!');
        console.log('NadeoServices token length:', APICredentials[1]?.accessToken?.length);
        console.log('NadeoLiveServices token length:', APICredentials[2]?.accessToken?.length);
        console.log('Raw token length:', APICredentials[3]?.length);
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
    }
}

testAuth();

require('dotenv').config();
const { loginUbi, loginTrackmaniaUbi, loginTrackmaniaNadeo } = require('trackmania-api-node');

async function testAuth() {
    console.log('Testing authentication...');
    console.log('Username:', process.env.UBI_USERNAME);
    console.log('Password length:', process.env.UBI_PASSWORD?.length);
    
    try {
        // Step 1: Ubisoft login
        console.log('\n1. Attempting Ubisoft login...');
        const credentials = Buffer.from(process.env.UBI_USERNAME + ':' + process.env.UBI_PASSWORD).toString('base64');
        console.log('Base64 credentials generated');
        
        const ubiLogin = await loginUbi(credentials);
        console.log('✅ Ubisoft login successful');
        console.log('Ticket length:', ubiLogin.ticket?.length);
        
        // Step 2: Trackmania Ubi login
        console.log('\n2. Attempting Trackmania Ubi login...');
        const nadeoLogin = await loginTrackmaniaUbi(ubiLogin.ticket);
        console.log('✅ Trackmania Ubi login successful');
        console.log('Access token length:', nadeoLogin.accessToken?.length);
        
        // Step 3: Trackmania Nadeo login
        console.log('\n3. Attempting Trackmania Nadeo login...');
        const trackmaniaNadeoLogin = await loginTrackmaniaNadeo(nadeoLogin.accessToken, 'NadeoLiveServices');
        console.log('✅ All authentication steps successful!');
        console.log('Final access token length:', trackmaniaNadeoLogin.accessToken?.length);
        
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAuth();

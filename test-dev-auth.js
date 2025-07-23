const { APILogin } = require('./functions/authentication.js');
require('dotenv').config();

async function testDevAuth() {
    console.log('🧪 Testing authentication with dev account...');
    
    try {
        console.log('Username:', process.env.UBI_USERNAME);
        console.log('Password length:', process.env.UBI_PASSWORD?.length);
        
        console.log('Starting authentication...');
        const start = Date.now();
        
        // Set a timeout for authentication
        const authPromise = APILogin();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Authentication timeout after 30 seconds')), 30000)
        );
        
        const APICredentials = await Promise.race([authPromise, timeoutPromise]);
        const duration = Date.now() - start;
        
        console.log(`✅ Authentication successful in ${duration}ms`);
        console.log('Credential array length:', APICredentials.length);
        console.log('Has access token:', !!APICredentials[2]?.accessToken);
        
        return { success: true, credentials: APICredentials };
        
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return { success: false, error: error.message };
    }
}

testDevAuth().then(result => {
    if (result.success) {
        console.log('\n🎉 Dev account authentication is working!');
    } else {
        console.log(`\n💔 Dev account authentication failed: ${result.error}`);
    }
    process.exit(0);
});

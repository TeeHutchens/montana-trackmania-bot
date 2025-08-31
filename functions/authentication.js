const { loginUbi, loginTrackmaniaUbi, loginTrackmaniaNadeo } = require('trackmania-api-node')
const dns = require('dns')

// Configure DNS to use fresh lookups and avoid caching issues
dns.setDefaultResultOrder('ipv4first')
// Clear DNS cache periodically to avoid stale entries
setInterval(() => {
    // Force DNS cache clear by changing the default resolver temporarily
    const originalResolvers = dns.getServers()
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    setTimeout(() => {
        dns.setServers(originalResolvers)
    }, 1000)
}, 6 * 60 * 60 * 1000) // Every 6 hours

// Test DNS resolution for key Trackmania domains
async function testDNSResolution() {
    const domains = [
        'prod.trackmania.core.nadeo.online',
        'live-services.trackmania.nadeo.live'
    ]
    
    for (const domain of domains) {
        try {
            const addresses = await new Promise((resolve, reject) => {
                dns.lookup(domain, { family: 4 }, (err, address) => {
                    if (err) reject(err)
                    else resolve(address)
                })
            })
            console.log(`✅ DNS resolution successful for ${domain}: ${addresses}`)
        } catch (error) {
            console.log(`❌ DNS resolution failed for ${domain}: ${error.message}`)
            throw new Error(`DNS resolution failed for ${domain}`)
        }
    }
}

async function ubiLogin(credentials) {
    try {
        console.log('Attempting Ubisoft login with credentials...')
        
        // Test DNS resolution first
        await testDNSResolution()
        
        return await loginUbi(credentials)
    } catch (e) {
        console.log('Ubisoft login error:', e.message)
        throw e
    }
}

async function nadeoLogin(ubiLogin) {
    try {
        const { ticket } = ubiLogin // login to ubi, level 0
        return await loginTrackmaniaUbi(ticket) // login to trackmania, level 1
    } catch (e) {
        // axios error
        console.log('Nadeo login error:', e.message)
        throw e
    }
}

async function trackmaniaNadeoLogin(nadeoLogin) {
    try {
        const { accessToken } = nadeoLogin // login to ubi, level 1
        return await loginTrackmaniaNadeo(accessToken, 'NadeoLiveServices') // login to trackmania, level 2
    } catch (e) {
        // axios error
        console.log('Trackmania Nadeo login error:', e.message)
        throw e
    }
}

async function APILogin() {
    const username = process.env.UBI_USERNAME;
    const password = process.env.UBI_PASSWORD;
    
    if (!username || !password) {
        throw new Error('UBI_USERNAME and UBI_PASSWORD must be set in .env file');
    }
    
    console.log(`Attempting authentication for user: ${username}`);
    
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔑 Authentication attempt ${attempt}/${maxRetries}`);
            
            // Try the base64 approach first (this is what the library expects)
            const credentials = Buffer.from(username + ':' + password).toString('base64')
            console.log('Generated base64 credentials');
            
            const loggedIn = await ubiLogin(credentials)
            const nadeoLoggedIn = await nadeoLogin(loggedIn)
            const trackmaniaNadeoLoggedIn = await trackmaniaNadeoLogin(nadeoLoggedIn)
            const nadeoToken = trackmaniaNadeoLoggedIn.accessToken

            console.log('✅ Authentication successful');
            return [loggedIn, nadeoLoggedIn, trackmaniaNadeoLoggedIn, nadeoToken];
        } catch (error) {
            lastError = error;
            console.error(`❌ Authentication attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < maxRetries) {
                console.log(`🔄 Clearing DNS cache and retrying in 2 seconds...`);
                
                // Force DNS cache clear on retry
                try {
                    const originalResolvers = dns.getServers();
                    dns.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    dns.setServers(originalResolvers);
                } catch (dnsError) {
                    console.log('DNS reset error (non-fatal):', dnsError.message);
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    // All retries failed
    console.error(`❌ All ${maxRetries} authentication attempts failed`);
    
    // Provide more specific error information
    if (lastError.code === 'ETIMEDOUT' || lastError.code === 'ECONNREFUSED') {
        throw new Error(`Network connectivity issue: Cannot reach Trackmania authentication servers after ${maxRetries} attempts. This may be a DNS or network issue.`);
    } else if (lastError.response && lastError.response.status === 401) {
        throw new Error(`Invalid credentials: Please check your UBI_USERNAME and UBI_PASSWORD`);
    } else {
        throw new Error(`Authentication failed after ${maxRetries} attempts: ${lastError.message}`);
    }
}

module.exports = {
    APILogin
};
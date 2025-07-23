const fetch = require('node-fetch');

async function findWorkingAPI() {
    console.log('Searching for working Trackmania APIs...');
    
    const apisToTest = [
        {
            name: 'trackmania.io - campaigns',
            url: 'https://trackmania.io/api/campaigns',
            headers: { 'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord' }
        },
        {
            name: 'trackmania.io - weekly',
            url: 'https://trackmania.io/api/campaigns/weekly',
            headers: { 'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord' }
        },
        {
            name: 'openplanet.dev API',
            url: 'https://openplanet.dev/api/competitions',
            headers: { 'User-Agent': 'montana-trackmania-bot: Discord bot for Trackmania leaderboards | Contact: @TeeHutchy on Discord' }
        }
    ];
    
    for (const api of apisToTest) {
        try {
            console.log(`\nTesting: ${api.name}`);
            console.log(`URL: ${api.url}`);
            
            const response = await fetch(api.url, { 
                headers: api.headers,
                timeout: 5000
            });
            
            console.log(`Status: ${response.status}`);
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                console.log(`Content-Type: ${contentType}`);
                
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    console.log(`Response length: ${text.length} characters`);
                    console.log(`Sample: ${text.substring(0, 200)}...`);
                    
                    try {
                        const json = JSON.parse(text);
                        console.log(`✅ Valid JSON response!`);
                        
                        if (Array.isArray(json)) {
                            console.log(`Array with ${json.length} items`);
                        } else if (typeof json === 'object') {
                            console.log(`Object with keys: ${Object.keys(json).join(', ')}`);
                        }
                    } catch (jsonError) {
                        console.log(`❌ Invalid JSON: ${jsonError.message}`);
                    }
                } else {
                    console.log(`❌ Not JSON content`);
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ Error: ${errorText.substring(0, 100)}...`);
            }
            
        } catch (error) {
            console.log(`❌ Request failed: ${error.message}`);
        }
    }
}

findWorkingAPI();

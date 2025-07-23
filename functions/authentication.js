const { loginUbi, loginTrackmaniaUbi, loginTrackmaniaNadeo } = require('trackmania-api-node')

async function ubiLogin(credentials) {
    try {
        console.log('Attempting Ubisoft login with credentials...');
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
        console.log(e)
    }
}

async function trackmaniaNadeoLogin(nadeoLogin) {
    try {
        const { accessToken } = nadeoLogin // login to ubi, level 1
        return await loginTrackmaniaNadeo(accessToken, 'NadeoLiveServices') // login to trackmania, level 2
    } catch (e) {
        // axios error
        console.log(e)
    }
}

async function APILogin() {
    const username = process.env.UBI_USERNAME;
    const password = process.env.UBI_PASSWORD;
    
    if (!username || !password) {
        throw new Error('UBI_USERNAME and UBI_PASSWORD must be set in .env file');
    }
    
    console.log(`Attempting authentication for user: ${username}`);
    
    // Try the base64 approach first (this is what the library expects)
    const credentials = Buffer.from(username + ':' + password).toString('base64')
    console.log('Generated base64 credentials');
    
    const loggedIn = await ubiLogin(credentials)
    const nadeoLoggedIn = await nadeoLogin(loggedIn)
    const trackmaniaNadeoLoggedIn = await trackmaniaNadeoLogin(nadeoLoggedIn)
    const nadeoToken = trackmaniaNadeoLoggedIn.accessToken
    return [loggedIn, nadeoLoggedIn, trackmaniaNadeoLoggedIn, nadeoToken]
}

module.exports = {
    APILogin
};
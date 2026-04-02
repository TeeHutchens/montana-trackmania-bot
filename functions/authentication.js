const fetch = require('node-fetch')
const { BOT_CONFIG } = require('../constants.js')
require('dotenv').config()

async function getNadeoToken(login, password, audience) {
    const credentials = Buffer.from(`${login}:${password}`).toString('base64')
    const response = await fetch('https://prod.trackmania.core.nadeo.online/v2/authentication/token/basic', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'User-Agent': BOT_CONFIG.USER_AGENT
        },
        body: JSON.stringify({ audience })
    })
    if (!response.ok) {
        const body = await response.text()
        throw new Error(`Nadeo auth failed (${audience}): ${response.status} ${body}`)
    }
    return response.json()
}

async function APILogin() {
    const login = process.env.NADEO_LOGIN
    const password = process.env.NADEO_PASSWORD

    if (!login || !password) {
        throw new Error('NADEO_LOGIN and NADEO_PASSWORD must be set in .env file')
    }

    console.log(`🔑 Authenticating Nadeo service account: ${login}`)

    const nadeoServices = await getNadeoToken(login, password, 'NadeoServices')
    console.log('✅ NadeoServices token obtained')

    const nadeoLiveServices = await getNadeoToken(login, password, 'NadeoLiveServices')
    console.log('✅ NadeoLiveServices token obtained')

    // Return shape matches what functions.js expects:
    // [1].accessToken  → NadeoServices  (getMaps, getMapRecords)
    // [2].accessToken  → NadeoLiveServices (nadeo_v1 t= headers)
    // [3]              → raw NadeoLiveServices token string (getTopPlayersGroup/Map)
    return [
        null,
        nadeoServices,
        nadeoLiveServices,
        nadeoLiveServices.accessToken
    ]
}

module.exports = { APILogin }

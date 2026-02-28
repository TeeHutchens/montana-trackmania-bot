// Test: api.trackmania.com display names + full campaign scores flow
// Run with: node test-display-names.js
require('dotenv').config();
const fetch = require('node-fetch');
const { loginUbi, loginTrackmaniaUbi, loginTrackmaniaNadeo } = require('trackmania-api-node');
const { getTopPlayersGroup } = require('trackmania-api-node');
const { BOT_CONFIG } = require('./constants.js');

// Known account IDs from the Montana leaderboard for spot-checking
const KNOWN_ACCOUNTS = [
    '8ac2e3be-31e9-4e33-b3a5-2fb26c3527df',
    'c1477572-e8b9-4ece-824b-ac2cec0042c9',
    'b12cb69d-72c9-43a3-bf3f-4d86180e5244',
    '4a7c2b5e-78a1-44f0-8af6-76baea50b8f3',
    'b5e2fccc-cf50-41b9-bb90-4f5866e994da'
];

async function getTMApiToken() {
    const clientId = process.env.APP_IDENTIFIER;
    const clientSecret = process.env.APP_SECRET;
    if (!clientId || !clientSecret) throw new Error('APP_IDENTIFIER and APP_SECRET must be set in .env');

    const response = await fetch('https://api.trackmania.com/api/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Token request failed: ${response.status} ${body}`);
    }
    const data = await response.json();
    return data.access_token;
}

async function getDisplayNames(accountIds, token) {
    const params = accountIds.map(id => `accountId[]=${encodeURIComponent(id)}`).join('&');
    const response = await fetch(`https://api.trackmania.com/api/display-names?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': BOT_CONFIG.USER_AGENT
        }
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body}`);
    }
    return await response.json(); // { accountId: displayName, ... }
}

async function run() {
    console.log('='.repeat(60));
    console.log('TEST: api.trackmania.com display names + Campaign Scores');
    console.log('='.repeat(60));

    // ── Step 1: TM API OAuth token ────────────────────────────────
    console.log('\n[1/4] Getting api.trackmania.com token...');
    let tmApiToken;
    try {
        tmApiToken = await getTMApiToken();
        console.log(`  ✅ Token obtained (length: ${tmApiToken.length})`);
    } catch (e) {
        console.log(`  ❌ Token request failed: ${e.message}`);
        process.exit(1);
    }

    // ── Step 2: displayNames with known IDs ──────────────────────
    console.log('\n[2/4] Testing display-names with known account IDs...');
    try {
        const nameMap = await getDisplayNames(KNOWN_ACCOUNTS, tmApiToken);
        const entries = Object.entries(nameMap);
        console.log(`  ✅ Got ${entries.length} result(s):`);
        for (const [id, name] of entries) {
            console.log(`     ${id}  →  ${name}`);
        }
        const missing = KNOWN_ACCOUNTS.filter(id => !nameMap[id]);
        if (missing.length > 0) {
            console.log(`  ⚠️  No result for:`);
            missing.forEach(id => console.log(`     ${id}`));
        }
    } catch (e) {
        console.log(`  ❌ display-names error: ${e.message}`);
    }

    // ── Step 3: Nadeo auth for leaderboard ───────────────────────
    const groupUid = process.env.GROUP_UID;
    console.log(`\n[3/4] Authenticating with Nadeo (for leaderboard)...`);
    let liveServicesToken;
    try {
        const credentials = Buffer.from(process.env.UBI_USERNAME + ':' + process.env.UBI_PASSWORD).toString('base64');
        const ubiResult = await loginUbi(credentials);
        console.log('  ✅ Ubisoft login OK');
        const nadeoResult = await loginTrackmaniaUbi(ubiResult.ticket);
        console.log('  ✅ Nadeo level-1 login OK');
        const liveResult = await loginTrackmaniaNadeo(nadeoResult.accessToken, 'NadeoLiveServices');
        liveServicesToken = liveResult.accessToken;
        console.log('  ✅ NadeoLiveServices token OK');
    } catch (e) {
        console.log(`  ❌ Nadeo auth failed: ${e.message}`);
        process.exit(1);
    }

    // ── Step 4: Live leaderboard + display names ──────────────────
    console.log(`\n[4/4] Campaign leaderboard + names (GROUP_UID=${groupUid})...`);
    if (!groupUid) {
        console.log('  ⚠️  GROUP_UID not set in .env — skipping.');
    } else {
        try {
            const topResult = await getTopPlayersGroup(liveServicesToken, groupUid);
            const playerList = topResult['tops'][3]['top'];
            console.log(`  ✅ Got ${playerList.length} players from leaderboard`);

            const accountIds = playerList.map(p => p.accountId);
            const nameMap = await getDisplayNames(accountIds, tmApiToken);

            console.log('\n  Leaderboard:');
            console.log('  ' + '-'.repeat(50));
            for (const player of playerList) {
                const name = nameMap[player.accountId] || `Player_${player.accountId.substring(0, 8)}`;
                console.log(`  #${String(player.position).padEnd(4)} ${name.padEnd(30)} SP: ${player.sp}`);
            }
            console.log('  ' + '-'.repeat(50));
        } catch (e) {
            console.log(`  ❌ Leaderboard error: ${e.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
}

run().then(() => process.exit(0)).catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
});

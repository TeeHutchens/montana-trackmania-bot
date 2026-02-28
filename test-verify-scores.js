// Verify campaign SP values vs in-game Montana leaderboard
// Run with: node test-verify-scores.js
require('dotenv').config();
const fetch = require('node-fetch');
const { loginUbi, loginTrackmaniaUbi, loginTrackmaniaNadeo } = require('trackmania-api-node');
const { BOT_CONFIG } = require('./constants.js');
const { cleanTrackName } = require('./functions/functions.js');

async function getTMApiToken() {
    const response = await fetch('https://api.trackmania.com/api/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(process.env.APP_IDENTIFIER)}&client_secret=${encodeURIComponent(process.env.APP_SECRET)}`
    });
    const data = await response.json();
    return data.access_token;
}

async function getDisplayNames(accountIds, tmToken) {
    const params = accountIds.map(id => `accountId[]=${encodeURIComponent(id)}`).join('&');
    const resp = await fetch(`https://api.trackmania.com/api/display-names?${params}`, {
        headers: { 'Authorization': `Bearer ${tmToken}`, 'User-Agent': BOT_CONFIG.USER_AGENT }
    });
    return await resp.json();
}

async function run() {
    console.log('='.repeat(65));
    console.log('VERIFY: Montana Weekly Shorts SP values');
    console.log('='.repeat(65));

    const creds = Buffer.from(process.env.UBI_USERNAME + ':' + process.env.UBI_PASSWORD).toString('base64');
    const ubi = await loginUbi(creds);
    const nadeo = await loginTrackmaniaUbi(ubi.ticket);
    const live = await loginTrackmaniaNadeo(nadeo.accessToken, 'NadeoLiveServices');
    const tmToken = await getTMApiToken();
    console.log('  ✅ Auth OK\n');

    // ── Campaign info ─────────────────────────────────────────────────────────
    const campaignResp = await fetch(
        'https://live-services.trackmania.nadeo.live/api/campaign/weekly-shorts?offset=0&length=1',
        { headers: { 'Authorization': 'nadeo_v1 t=' + live.accessToken, 'User-Agent': BOT_CONFIG.USER_AGENT } }
    );
    const campaign = (await campaignResp.json()).campaignList[0];
    const seasonUid = campaign.seasonUid;

    console.log(`  Campaign : ${campaign.name}`);
    console.log(`  seasonUid: ${seasonUid}`);
    console.log(`  Period   : ${new Date(campaign.startTimestamp * 1000).toISOString().split('T')[0]} → ${new Date(campaign.endTimestamp * 1000).toISOString().split('T')[0]}`);
    console.log(`  Tracks   : ${campaign.playlist.length}\n`);

    // ── Overall Montana leaderboard ───────────────────────────────────────────
    const lbResp = await fetch(
        `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/${seasonUid}/top?length=100&onlyWorld=false`,
        { headers: { 'Authorization': 'nadeo_v1 t=' + live.accessToken, 'User-Agent': BOT_CONFIG.USER_AGENT } }
    );
    const lbData = await lbResp.json();

    const montanaZone = (lbData.tops || []).find(z => z.zoneName && z.zoneName.toLowerCase() === 'montana');

    if (!montanaZone || !montanaZone.top || montanaZone.top.length === 0) {
        console.log('  ❌ No Montana zone found in leaderboard');
        process.exit(1);
    }

    const accountIds = montanaZone.top.map(p => p.accountId);
    const nameMap = await getDisplayNames(accountIds, tmToken);

    console.log('  ── Campaign total SP (compare this with in-game Montana leaderboard) ──');
    console.log(`  ${'Pos'.padEnd(5)} ${'Player'.padEnd(25)} ${'SP'.padEnd(8)} Zone`);
    console.log('  ' + '─'.repeat(62));
    for (const p of montanaZone.top) {
        const name = nameMap[p.accountId] || p.accountId.substring(0, 8);
        console.log(`  ${String(p.position).padEnd(5)} ${name.padEnd(25)} ${String(p.sp).padEnd(8)} ${p.zoneName}`);
    }
    console.log('  ' + '─'.repeat(62));
    console.log(`  API returns ${montanaZone.top.length} Montana players (API may cap at 5 per zone)\n`);

    // ── Per-track Montana positions ────────────────────────────────────────────
    console.log('  ── Per-track positions (position on each map, Montana zone) ──────────');

    // Build a map of player → track positions
    const playerTracks = {}; // accountId → [pos1, pos2, ...]
    for (const p of montanaZone.top) playerTracks[p.accountId] = [];

    for (let i = 0; i < campaign.playlist.length; i++) {
        const mapUid = campaign.playlist[i].mapUid;

        const rawNameResp = await fetch(
            `https://live-services.trackmania.nadeo.live/api/token/map/${mapUid}`,
            { headers: { 'Authorization': 'nadeo_v1 t=' + live.accessToken, 'User-Agent': BOT_CONFIG.USER_AGENT } }
        );
        const rawName = (await rawNameResp.json()).name || '';
        const trackName = cleanTrackName(rawName) || `Track ${i + 1}`;

        const mapLbResp = await fetch(
            `https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${mapUid}/top?length=100&offset=0`,
            { headers: { 'Authorization': 'nadeo_v1 t=' + live.accessToken, 'User-Agent': BOT_CONFIG.USER_AGENT } }
        );
        const mapLbData = await mapLbResp.json();
        const mapMontana = (mapLbData.tops || []).find(z => z.zoneName === 'Montana');

        // Position each known Montana player had on this track
        const trackPositions = {};
        if (mapMontana && mapMontana.top) {
            for (const p of mapMontana.top) {
                trackPositions[p.accountId] = p.position;
            }
        }

        console.log(`\n  Track ${i + 1}: ${trackName}`);
        for (const p of montanaZone.top) {
            const name = nameMap[p.accountId] || p.accountId.substring(0, 8);
            const pos = trackPositions[p.accountId];
            const posStr = pos != null ? `#${pos} in Montana` : 'not ranked';
            console.log(`    ${name.padEnd(25)} ${posStr}`);
        }
    }

    console.log('\n' + '='.repeat(65));
    console.log('DONE — compare SP totals above with your in-game Montana leaderboard');
    console.log('='.repeat(65));
}

run().then(() => process.exit(0)).catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});

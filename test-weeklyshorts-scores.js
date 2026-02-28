// Test: /weeklyshorts scores flow
// Mirrors exactly what the Discord bot does when this command is invoked.
// Run with: node test-weeklyshorts-scores.js
require('dotenv').config();
const { getMontanaSpecificScores } = require('./functions/functions.js');
const { scoreFormatter } = require('./helper/helper.js');

// scoreFormatter returns [rankString, playersString, scoresString]
// Print it as a table instead of a Discord embed
function printScoresTable(formattedData, campaignName) {
    const [ranks, players, scores] = formattedData;
    const rankLines    = ranks.trim().split('\n');
    const playerLines  = players.trim().split('\n');
    const scoreLines   = scores.trim().split('\n');

    console.log(`\n  🏔️  Montana Weekly Shorts — ${campaignName}`);
    console.log('  ' + '─'.repeat(52));
    console.log(`  ${'Rank'.padEnd(6)} ${'Player'.padEnd(30)} SP`);
    console.log('  ' + '─'.repeat(52));
    for (let i = 0; i < playerLines.length; i++) {
        const rank   = (rankLines[i]   || '').trim().padEnd(6);
        const player = (playerLines[i] || '').trim().padEnd(30);
        const sp     = (scoreLines[i]  || '').trim();
        console.log(`  ${rank} ${player} ${sp}`);
    }
    console.log('  ' + '─'.repeat(52));
}

async function run() {
    console.log('='.repeat(60));
    console.log('TEST: /weeklyshorts scores');
    console.log('='.repeat(60));

    console.log('\n[1/1] Calling getMontanaSpecificScores()...');
    console.log('       (auth → Weekly Shorts seasonUid → leaderboard → player names)\n');

    const start = Date.now();
    const result = await getMontanaSpecificScores();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (result.success) {
        console.log(`  ✅ Success (${elapsed}s)`);
        console.log(`  📊 Campaign: ${result.campaignName}`);
        console.log(`  👥 Players returned: ${result.data?.users?.length ?? 0}`);

        if (result.data?.users?.length > 0) {
            const formatted = scoreFormatter(result.data);
            printScoresTable(formatted, result.campaignName);
        } else {
            console.log('  ⚠️  No players in result.data.users');
        }
    } else {
        console.log(`  ❌ Failed (${elapsed}s)`);
        console.log(`  Error: ${result.error}`);
        if (result.fallbackMessage) {
            console.log('\n  Fallback message (what Discord would show):');
            console.log('  ' + result.fallbackMessage.trim().split('\n').join('\n  '));
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

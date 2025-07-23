// Import all the components we need
const { getMontanaTopPlayerTimes } = require('./functions/functions.js');
const { montanaEmbedFormatter } = require('./helper/helper.js');

async function showFinalDiscordOutput() {
    console.log('🎮 FINAL DISCORD BOT OUTPUT PREVIEW');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const testMapUid = 'DjFV3YNUHOFo1Zxl6vLKcAnFZ30';
    const trackName = 'Red Driveby';
    const authorName = 'TrackMaster';
    const authorAccountId = 'author123';
    
    try {
        // Get Montana data
        console.log('🔄 Getting Montana leaderboard data...');
        const montanaResult = await getMontanaTopPlayerTimes(testMapUid);
        
        // Clean the result (remove suffix)
        const cleanResult = montanaResult.replace(/\n\n🏔️ \*Montana Group Rankings\*$/, '');
        
        console.log('📊 CLEANED LEADERBOARD DATA:');
        console.log('───────────────────────────────');
        console.log(`"${cleanResult}"`);
        console.log(`Length: ${cleanResult.length} characters`);
        console.log('───────────────────────────────\n');
        
        // Create the embed
        const embed = montanaEmbedFormatter(trackName, testMapUid, cleanResult, authorName, authorAccountId);
        
        console.log('🎯 DISCORD EMBED PREVIEW:');
        console.log('═════════════════════════════════════════════════════════════════');
        console.log(`🎨 COLOR: ${embed.color} (Montana Blue)`);
        console.log(`🏔️ TITLE: ${embed.title}`);
        console.log(`🔗 URL: ${embed.url}`);
        console.log(`👤 AUTHOR: ${embed.author?.name || 'Not set'}`);
        console.log('');
        console.log('📋 FIELDS:');
        if (embed.fields && embed.fields.length > 0) {
            embed.fields.forEach((field, i) => {
                console.log(`  Field ${i + 1}: ${field.name}`);
                console.log(`  Content: "${field.value}"`);
                console.log(`  Content Type: ${typeof field.value}`);
                console.log(`  Content Length: ${field.value ? field.value.length : 'null/undefined'}`);
                console.log('');
            });
        } else {
            console.log('  ❌ No fields found in embed');
        }
        console.log(`🦶 FOOTER: ${embed.footer?.text || 'Not set'}`);
        console.log('═════════════════════════════════════════════════════════════════');
        
        console.log('\n✨ WHAT DISCORD USERS WILL SEE:');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log(`│ 🏔️ ${trackName} - Montana Leaderboard                       │`);
        console.log(`│ Created by ${authorName}                                     │`);
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│ 🏆 Montana Top Players                                     │');
        if (cleanResult && cleanResult.trim()) {
            const lines = cleanResult.split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    console.log(`│ ${line.padEnd(57)} │`);
                }
            });
        } else {
            console.log('│ No times recorded yet                                       │');
        }
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│ 🏔️ Montana Trackmania Community | Weekly Shorts            │');
        console.log('└─────────────────────────────────────────────────────────────┘');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

showFinalDiscordOutput();

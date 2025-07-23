const { getWeeklyShorts } = require('../functions/functions.js');

async function testDiscordBotOutput() {
    console.log('🤖 Testing Discord bot /weeklyshorts command output...');
    console.log('This simulates exactly what the Discord bot will show:\n');
    
    try {
        console.log('🔄 Running getWeeklyShorts() function...\n');
        
        const result = await getWeeklyShorts();
        
        console.log('📋 DISCORD BOT OUTPUT:');
        console.log('=' * 50);
        
        if (Array.isArray(result)) {
            // Multiple embeds (multiple tracks)
            result.forEach((embed, index) => {
                console.log(`\n📊 TRACK ${index + 1}:`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`🏁 **${embed.title}**`);
                console.log(`🔗 Map UID: ${embed.url}`);
                console.log(`👤 Author: ${embed.author?.name || 'Unknown'}`);
                console.log('');
                console.log('🏆 **Leaderboard:**');
                console.log(embed.description);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            });
        } else if (typeof result === 'string') {
            // Error message
            console.log('❌ ERROR MESSAGE:');
            console.log(result);
        } else {
            // Single embed
            console.log('🏁 **TRACK:**');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            if (result.title) console.log(`📊 **${result.title}**`);
            if (result.url) console.log(`🔗 Map UID: ${result.url}`);
            if (result.author?.name) console.log(`👤 Author: ${result.author.name}`);
            console.log('');
            console.log('🏆 **Leaderboard:**');
            if (result.description) console.log(result.description);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
        
        console.log('\n✅ This is exactly what Discord users will see when they run /weeklyshorts');
        
    } catch (error) {
        console.error('❌ Error testing Discord bot output:', error.message);
        console.log('\n🔄 Discord bot would show error message or fallback to world rankings');
    }
}

testDiscordBotOutput();

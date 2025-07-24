const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

async function checkCommands() {
    try {
        console.log('📋 Checking currently registered Discord commands...');
        
        // Get guild commands
        const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID));
        
        console.log(`\n🏠 Guild Commands (${guildCommands.length}):`);
        guildCommands.forEach((cmd, index) => {
            console.log(`${index + 1}. ${cmd.name} - ${cmd.description}`);
            if (cmd.options && cmd.options.length > 0) {
                cmd.options.forEach(option => {
                    console.log(`   └─ ${option.name} (${option.type}) - ${option.description}`);
                });
            }
        });
        
        // Get global commands
        const globalCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
        
        console.log(`\n🌍 Global Commands (${globalCommands.length}):`);
        globalCommands.forEach((cmd, index) => {
            console.log(`${index + 1}. ${cmd.name} - ${cmd.description}`);
            if (cmd.options && cmd.options.length > 0) {
                cmd.options.forEach(option => {
                    console.log(`   └─ ${option.name} (${option.type}) - ${option.description}`);
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Error checking commands:', error.message);
    }
}

checkCommands();

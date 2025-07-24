const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

// Delete all guild commands
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] })
    .then(() => {
        console.log('Successfully deleted all guild commands.');
        // Wait a moment then redeploy
        setTimeout(() => {
            console.log('Redeploying commands...');
            require('./deploy-commands.js');
        }, 2000);
    })
    .catch(console.error);

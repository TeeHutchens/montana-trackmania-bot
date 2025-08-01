// Run this script to deploy new commands on Discord server.

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const allowed = process.env.ALLOWED_COMMANDS
        ? process.env.ALLOWED_COMMANDS.split(',').map(c => c.trim())
        : ['weeklyshorts'];

for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (allowed.includes(command.data.name)) {
                commands.push(command.data.toJSON());
        }
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
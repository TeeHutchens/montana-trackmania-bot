const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');

require('dotenv').config()

let currentCampaignId = null

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES
	]
})

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

const allowed = process.env.ALLOWED_COMMANDS
        ? process.env.ALLOWED_COMMANDS.split(',').map((c) => c.trim())
        : ['weeklyshorts'];

for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (allowed.includes(command.data.name)) {
                client.commands.set(command.data.name, command);
        }
}

client.once('ready', async () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.DISCORD_TOKEN)



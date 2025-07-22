const { SlashCommandBuilder } = require('@discordjs/builders');
const { getWeeklyShorts } = require('../functions/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weeklyshorts')
        .setDescription('Get top 5 players for each Weekly Short map'),
    async execute(interaction) {
        await interaction.deferReply();
        const results = await getWeeklyShorts();
        if (!results.length) {
            await interaction.editReply('Unable to fetch Weekly Shorts data.');
            return;
        }
        await interaction.editReply({ embeds: results });
    },
};

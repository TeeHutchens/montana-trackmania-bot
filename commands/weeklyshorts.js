const { SlashCommandBuilder } = require('@discordjs/builders');
const helper = require("../helper/helper.js")
const { getWeeklyShorts, getMontanaSpecificScores, getMontanaWeeklyTrack } = require('../functions/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weeklyshorts')
        .setDescription('Weekly Shorts campaign information')
        .addSubcommand(subcommand =>
            subcommand
                .setName('maps')
                .setDescription('Get top 5 players for each Weekly Short map'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('scores')
                .setDescription('Get Montana-specific scores for the current Weekly Shorts campaign'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('track')
                .setDescription('Get Montana records for a specific Weekly Shorts track')
                .addIntegerOption(option =>
                    option.setName('week')
                        .setDescription('Week number (1 = oldest, current week, etc.)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(200))
                .addIntegerOption(option =>
                    option.setName('track')
                        .setDescription('Track number within the week (1-5)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(5))),
    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        console.log(`WeeklyShorts subcommand: "${subcommand}"`);

        if (subcommand === 'maps') {
            const results = await getWeeklyShorts();
            if (!results.length) {
                await interaction.editReply('Unable to fetch Weekly Shorts data.');
                return;
            }
            await interaction.editReply({ embeds: results });

        } else if (subcommand === 'scores') {
            const result = await getMontanaSpecificScores();

            if (result.success) {
                const formattedScores = helper.scoreFormatter(result.data);
                const embed = helper.embedScoresFormatter(
                    formattedScores,
                    'Montana Weekly Shorts',
                    'montana'
                );
                embed.setTitle('🏔️ Montana Weekly Shorts - Top Scores');
                embed.setDescription('Montana players ranked by official Trackmania SP (Score Points)');
                embed.setColor('#4A90E2');
                embed.setFooter({ text: '🏔️ Official Trackmania Campaign Leaderboard | Montana Community' });
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply(result.fallbackMessage || `❌ Error: ${result.error}`);
            }

        } else if (subcommand === 'track') {
            const weekNumber = interaction.options.getInteger('week');
            const trackNumber = interaction.options.getInteger('track');
            console.log(`WeeklyShorts track: Week ${weekNumber}, Track ${trackNumber}`);

            const result = await getMontanaWeeklyTrack(weekNumber, trackNumber);

            if (result.success) {
                await interaction.editReply({ embeds: [result.embed] });
            } else {
                await interaction.editReply(result.fallbackMessage || `❌ Error: ${result.error}`);
            }

        } else {
            await interaction.editReply('Unknown subcommand. Use `/weeklyshorts maps`, `/weeklyshorts scores`, or `/weeklyshorts track`');
        }
    },
};

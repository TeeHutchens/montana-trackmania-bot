const { SlashCommandBuilder } = require('@discordjs/builders');
const helper = require("../helper/helper.js")
const { getWeeklyShorts, getWeeklyShortsTopFive, getMontanaSpecificScores } = require('../functions/functions.js');

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
                .setDescription('Get Montana-specific scores for the current Weekly Shorts campaign')),
    async execute(interaction) {
        await interaction.deferReply();
        
        const subcommand = interaction.options.getSubcommand();
        console.log(`🔍 WeeklyShorts command executed with subcommand: "${subcommand}"`);
        console.log(`🔍 Subcommand received: "${subcommand}"`); // Debugging log
        
        if (subcommand === 'maps') {
            console.log('📍 Executing MAPS function (getWeeklyShorts)');
            const results = await getWeeklyShorts();
            if (!results.length) {
                console.log('❌ No data returned from getWeeklyShorts'); // Debugging log
                await interaction.editReply('Unable to fetch Weekly Shorts data.');
                return;
            }
            console.log('✅ Successfully fetched Weekly Shorts data'); // Debugging log
            await interaction.editReply({ embeds: results });
        } else if (subcommand === 'scores') {
            console.log('🏔️ Executing SCORES function (Montana-specific leaderboard)');
            const montanaGroupId = '5368f740-4cb3-4460-8f85-6b5bac67c7d1';
            const result = await getMontanaSpecificScores(montanaGroupId);
            
            if (result.success) {
                console.log('✅ Successfully fetched Montana-specific scores'); // Debugging log
                
                // Format the data using the scoreFormatter first
                const formattedScores = helper.scoreFormatter(result.data);
                
                // Then create the embed
                const embed = helper.embedScoresFormatter(
                    formattedScores,
                    'Montana Weekly Shorts',
                    'montana'
                );
                
                // Customize the embed for Montana
                embed.setTitle('🏔️ Montana Weekly Shorts - Top Scores');
                embed.setDescription('Montana players ranked by official Trackmania SP (Score Points)');
                embed.setColor('#4A90E2');
                embed.setFooter({ text: '🏔️ Official Trackmania Campaign Leaderboard | Montana Community' });
                
                await interaction.editReply({ embeds: [embed] });
            } else {
                console.log(`❌ Error fetching Montana-specific scores: ${result.error}`); // Debugging log
                await interaction.editReply(result.fallbackMessage || `❌ Error: ${result.error}`);
            }
        } else {
            console.log(`❌ Unknown subcommand received: "${subcommand}"`); // Debugging log
            await interaction.editReply('Unknown subcommand. Use /weeklyshorts maps or /weeklyshorts scores');
        }
    },
};

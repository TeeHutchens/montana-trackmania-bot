const { SlashCommandBuilder } = require('@discordjs/builders');
const helper = require("../helper/helper.js")
const { getMontanaCampaignTrack, getMontanaCampaignScores } = require('../functions/functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('campaign')
        .setDescription('Current seasonal campaign information for Montana players')
        .addSubcommand(subcommand =>
            subcommand
                .setName('track')
                .setDescription('Get Montana records for a specific campaign track')
                .addIntegerOption(option =>
                    option.setName('track')
                        .setDescription('Track number within the current campaign (1-25)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(25)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('scores')
                .setDescription('Get Montana-specific scores for the current seasonal campaign')),
    async execute(interaction) {
        await interaction.deferReply();
        
        const subcommand = interaction.options.getSubcommand();
        console.log(`🔍 Campaign command executed with subcommand: "${subcommand}"`);
        
        if (subcommand === 'track') {
            console.log('🎯 Executing TRACK function (current campaign track)');
            
            const trackNumber = interaction.options.getInteger('track');
            
            console.log(`🏆 User requested Current Campaign Track ${trackNumber}`);
            
            const result = await getMontanaCampaignTrack(trackNumber);
            
            if (result.success) {
                console.log(`✅ Successfully fetched Campaign Track ${trackNumber} data`);
                await interaction.editReply({ embeds: [result.embed] });
            } else {
                console.log(`❌ Error fetching Campaign Track ${trackNumber}: ${result.error}`);
                await interaction.editReply(result.fallbackMessage || `❌ Error: ${result.error}`);
            }
        } else if (subcommand === 'scores') {
            console.log('🏔️ Executing SCORES function (Montana campaign leaderboard)');
            
            const result = await getMontanaCampaignScores();
            
            if (result.success) {
                console.log('✅ Successfully fetched Montana campaign scores');
                
                // Format the data using the scoreFormatter first
                const formattedScores = helper.scoreFormatter(result.data);
                
                // Then create the embed
                const embed = helper.embedScoresFormatter(
                    formattedScores,
                    result.campaignName || 'Current Campaign',
                    'campaign'
                );
                
                // Customize the embed for Montana campaign
                embed.setTitle(`🏆 ${result.campaignName || 'Current Campaign'} - Montana Scores`);
                embed.setDescription(`🏔️ Montana players ranked by official Trackmania SP (Score Points) - ${result.trackCount} tracks`);
                embed.setColor('#4A90E2');
                embed.setFooter({ text: '🏆 Official Trackmania Campaign Leaderboard | Montana Community' });
                
                await interaction.editReply({ embeds: [embed] });
            } else {
                console.log(`❌ Error fetching Montana campaign scores: ${result.error}`);
                await interaction.editReply(result.fallbackMessage || `❌ Error: ${result.error}`);
            }
        } else {
            console.log(`❌ Unknown subcommand received: "${subcommand}"`);
            await interaction.editReply('Unknown subcommand. Use `/campaign track` or `/campaign scores`');
        }
    },
};

const { SlashCommandBuilder } = require('@discordjs/builders')
const { getTopPlayerScoresByRegion } = require('../functions/functions.js')
const { embedRegionScoresFormatter } = require('../helper/helper.js')
const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackmania')
        .setDescription('Get region score leaders for the current official campaign.')
        .addStringOption(option => option.setName('region').setDescription('Enter the region name').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply()
        const region = interaction.options.getString('region')
        const campaign = await TMIOclient.campaigns.currentSeason()
        const topPlayers = await getTopPlayerScoresByRegion(process.env.GROUP_UID, region)
        if (!topPlayers) {
            await interaction.editReply('Region not found.')
            return
        }
        const result = embedRegionScoresFormatter(topPlayers, campaign.name, campaign.id, region)
        await interaction.editReply({ embeds: [result] })
    },
}

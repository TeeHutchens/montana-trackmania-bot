const { SlashCommandBuilder } = require('@discordjs/builders')
const { getTopPlayerScores } = require('../functions/functions.js')
const { embedScoresFormatter } = require("../helper/helper.js")
const { BOT_CONFIG } = require('../constants.js')
const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client()
TMIOclient.setUserAgent(BOT_CONFIG.USER_AGENT)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('currentleaders')
		.setDescription('Get current official campaign score leaders.'),
	async execute(interaction) {
		await interaction.deferReply()
		try {
			const campaign = await TMIOclient.campaigns.currentSeason()
			const topPlayers = await getTopPlayerScores(process.env.GROUP_UID)
			const result = embedScoresFormatter(topPlayers, campaign.name, campaign.id)
			await interaction.editReply({ embeds: [result] })
		} catch (error) {
			console.log('Error in /currentleaders:', error.message || error)
			await interaction.editReply('Unable to fetch current leaders. The trackmania.io API may be unavailable.')
		}
	},
};

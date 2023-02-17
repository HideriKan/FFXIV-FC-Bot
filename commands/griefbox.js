const { ModalBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('suggestionbox')
		.setDescription('An anonymized place to send your thoughts about the static')
	,
	/**
	 * 
	 * @param {import("discord.js").BaseInteraction} interaction 
	 */
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId('paper')
			.setTitle('Anonymized Paper');

		const content = new TextInputBuilder()
			.setCustomId('content')
			.setLabel('Write your thought down.')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);

		const actionRow = new ActionRowBuilder().addComponents(content);
		modal.addComponents(actionRow);

		await interaction.showModal(modal);
	}
};
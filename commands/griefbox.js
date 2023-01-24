const { ModalBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, BaseInteraction } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('griefbox')
		.setDescription('An anonymized place to send your thoughts about the static')
	,
	/**
	 * 
	 * @param {BaseInteraction} interaction 
	 */
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId('griefpaper')
			.setTitle('Anonymized Paper');

		const content = new TextInputBuilder()
			.setCustomId('griefcontent')
			.setLabel('Please write your thought down.')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);

		const actionRow = new ActionRowBuilder().addComponents(content);
		modal.addComponents(actionRow);

		await interaction.showModal(modal);
	}
}
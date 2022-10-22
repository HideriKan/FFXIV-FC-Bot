const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const RaidWeek = require('../Classes/RaidWeek');
const { getStartingDay } = require('../utility');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createschedule')
		.setDescription('Creates a new Schedule for the raid command to be displayed')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.addBooleanOption(option => option.setName('next')
			.setDescription('Edit current week?')
			.setRequired(true))
		.addStringOption(option => option.setName('batch')
			.setDescription('Add week times in Tu/We/Th/Fr/Sa/Su/Mo')
			.setRequired(true))
	,
	/**
	 * Function of the Create Times (ct) Command
	 * Create or Adjust the Raid times
	 * @param {import('discord.js').Interaction} interaction
	 */
	async execute(interaction) {
		const raidWeek = new RaidWeek();
		const editNext = interaction.options.getBoolean('next');
		const batch = interaction.options.getString('batch');
		const batchArr = batch.split('/');
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('savage')
					.setLabel('Savage')
					.setStyle(ButtonStyle.Secondary)
			).addComponents(
				new ButtonBuilder()
					.setCustomId('ult')
					.setLabel('Ult')
					.setStyle(ButtonStyle.Secondary)
			);


		if (editNext) // when the user is chosing a next week
			raidWeek.startingWeekDay = getStartingDay(true);

		raidWeek.newDaysFromBatch(batchArr);

		raidWeek.writeJson();
		await interaction.reply({ content: 'New Times have been saved', components: [row] });
	},
};
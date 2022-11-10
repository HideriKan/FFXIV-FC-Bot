const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const RaidWeek = require('../Classes/RaidWeek');
const { getStartingDay } = require('../utility');

module.exports = {
	// TODO: change name to time
	// TODO: change to subcommand create
	// TODO: merge edit time into this as a subcommand edit
	data: new SlashCommandBuilder()
		.setName('createschedule')
		.setDescription('Creates a new Schedule for the raid command to be displayed')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.addBooleanOption(opt => opt.setName('next')
			.setDescription('Edit current week?')
			.setRequired(true))
		.addStringOption(opt => opt.setName('batch')
			.setDescription('Add week times in Tu/We/Th/Fr/Sa/Su/Mo')
			.setRequired(true))
	,
	/**
	 * createschedule will take a true or false if the new schedule is for the current week or the next one.
	 * the other argument will be the batch which contain the string array of the raid times
	 * @param {import('discord.js').Interaction} interaction message interaction
	 */
	async execute(interaction) {
		// get user option
		const editNext = interaction.options.getBoolean('next');
		const batch = interaction.options.getString('batch');
		// process user batch
		let batchArr = batch.split('/');

		// reduce the array when its too big
		if (batchArr.lenght > 7)
			batchArr = batchArr.slice(0, 7);

		// fill the array when its to small
		while (batchArr.lenght < 7)
			batchArr.push('');

		const raidWeek = new RaidWeek();
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
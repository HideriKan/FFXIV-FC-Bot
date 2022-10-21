const { Interaction, SlashCommandBuilder } = require('discord.js');
const RaidWeek = require('../RaidWeek');
const { getStartingDay } = require('../utility');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createschedule')
		.setDescription('Creates a new Schedule for the raid command to be displayed')
		.addBooleanOption(option => 
			option.setName('next')
				.setDescription('Edit current week?')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('batch')
				.setDescription('Add week times in Tu/We/Th/Fr/Sa/Su/Mo')
				.setRequired(true))
	,
	/**
	 * Function of the Create Times (ct) Command
	 * Create or Adjust the Raid times
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		if (interaction.channel.type == 'DM') {
			interaction.reply({
				content: 'Dont use this command in the dms for the scheduled guild events',
				ephemeral: true
			});
			return;
		}


		if (interaction.memberPermissions.equals('MANAGE_EVENTS')) {
			interaction.reply({
				content: 'No permission',
				ephemeral: true
			});
			return;
		}


		const raidWeek = new RaidWeek();
		const editNext = interaction.options.getBoolean('next');
		const batch = interaction.options.getString('batch');
		const batchArr = batch.split('/');

		if (editNext) // when the user is chosing a next week
			raidWeek.startingWeekDay = getStartingDay(true);

		raidWeek.newDaysFromBatch(batchArr);

		raidWeek.writeJson();
		interaction.reply('New Times have been saved');
	},
};
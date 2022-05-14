const { SlashCommandBuilder } = require('@discordjs/builders');
// const { Interaction } = require('discord.js');
const RaidWeek = require('../RaidWeek');
const getStartingDay = require('../utility');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createschedule')
		.setDescription('Creates a new Schedule for the raid command to be displayed')
		.addBooleanOption( option => option.setName('next').setDescription('Edit current week?').setRequired(true))
		.addStringOption( option => 
			option.setName('batch')
				.setDescription('Add week times in Tu/We/Th/Fr/Sa/Su/Mo')
				.setRequired(true))
		// .addStringOption( option => option.setName('tu').setDescription('Time for Tuesday'))
		// .addStringOption( option => option.setName('we').setDescription('Time for Wednesday'))
		// .addStringOption( option => option.setName('th').setDescription('Time for Thursday'))
		// .addStringOption( option => option.setName('fr').setDescription('Time for Friday'))
		// .addStringOption( option => option.setName('sa').setDescription('Time for Saturday'))
		// .addStringOption( option => option.setName('su').setDescription('Time for Sunday'))
		// .addStringOption( option => option.setName('mo').setDescription('Time for Monday'))
	,
	/**
	 * Function of the Create Times (ct) Command
	 * Create or Adjust the Raid times
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		const raidWeek = new RaidWeek();
		const editNext = interaction.options.getBoolean('next');
		const batch = interaction.options.getString('batch');
		const batchArr = batch.split('/');		
		// batchArr.push(interaction.options.getString('tu'));
		// batchArr.push(interaction.options.getString('we'));
		// batchArr.push(interaction.options.getString('th'));
		// batchArr.push(interaction.options.getString('fr'));
		// batchArr.push( interaction.options.getString('sa'));
		// batchArr.push( interaction.options.getString('su'));
		// batchArr.push(interaction.options.getString('mo'));

		if (editNext) // when the user is chosing a next week
			raidWeek.startingWeekDay = getStartingDay(true);

		raidWeek.newDaysFromBatch(batchArr);

		raidWeek.writeJson();
		interaction.reply('New Times have been saved');
	},
};
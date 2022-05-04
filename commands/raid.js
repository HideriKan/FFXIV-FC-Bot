const {
	SlashCommandBuilder
} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const RaidWeek = require('../RaidWeek');

// Arguments
const RAIDONLY = 'raidOnly'; 
const PIN = 'pin';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('raid')
		.setDescription('Shows the Raid Schedule')
		.addStringOption(option =>
			option.setName('mods')
				.setDescription('Add Optional Modifiers')
				.addChoice('Shows only the raid days', RAIDONLY)
				.addChoice('Pins the message (Does not work currently)', PIN)
		),
	/**
	 * Displays the current raid schedule
	 * Sends an Embed with the raid times into the corresponding channel
	 * @param {Interaction} interaction 
	 * @argument pin Will pin the post afterwards
	 * @argument ro (Raidonly) Will only show the days when there is raid
	 */
	async execute(interaction) {
		const raidWeek = new RaidWeek();
		const dFormat = new Intl.DateTimeFormat('de', {
			month: '2-digit',
			day: '2-digit',
			timeZone: 'UTC'
		});

		let fields = new Array();
		let fWeek = new Array();

		let modifiers = interaction.options.getString('mods');
		if (modifiers === null) modifiers = new Array();

		const onlyRaidDays = modifiers.includes(RAIDONLY);
		const toPin = modifiers.includes(PIN);

		raidWeek.readJson();

		if (onlyRaidDays) {
			fWeek = raidWeek.week.filter(day => day.isRaid);
			fWeek.forEach(day => {
				fields.push(day.toField());
			});
		} else {
			raidWeek.week.forEach(day => {
				fields.push(day.toField());
			});
		} // End of if else

		const startingDay = new Date(raidWeek.startingWeekDay);
		const dateRange = dFormat.format(startingDay) + ' ~ ' + dFormat.format(startingDay.setDate(startingDay.getDate() + 7));

		const embed = new MessageEmbed()
			.setTitle('Raid Schedule (' + dateRange + ')')
			.setDescription('Please do tell when there is a day that you dont have time so we can adjust the schedule')
			.setColor('#dc4fad')
			.setFooter({ text: 'The Time is in Server Time (ST) / UTC'})
			.addFields(fields);

		await interaction.reply({ embeds: [embed] })
			.then(msg => { 
				if (toPin) msg.pin(); //TODO: doesnt work
			})
			.catch(err => console.error(err));
	},
};

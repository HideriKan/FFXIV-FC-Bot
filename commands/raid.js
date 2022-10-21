const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const RaidWeek = require('../RaidWeek');

// Arguments
const argLite = 'lite';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('raid')
		.setDescription('[Beta] Shows the Raid Schedule')
		.addStringOption(opt => opt.setName('options')
			.setDescription('Optional Modifiers')
			.addChoices({ name: 'Lite', value: argLite }
			)
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

		let opt = interaction.options.getString('options');
		if (opt === null)
			opt = new Array();

		const onlyRaidDays = opt.includes(argLite);

		raidWeek.readJson();

		if (onlyRaidDays) {
			raidWeek.week.forEach(day => {
				if (day.isRaid)
					fields.push(day.toField());
			});
		} else {
			raidWeek.week.forEach(day => {
				fields.push(day.toField());
			});
		} // End of if else

		const startingDay = new Date(raidWeek.startingWeekDay);
		const dateRange = dFormat.format(startingDay) + ' ~ ' + dFormat.format(startingDay.setDate(startingDay.getDate() + 7));

		const embed = new EmbedBuilder()
			.setTitle('Raid Schedule (' + dateRange + ')')
			.setColor('#dc4fad')
			.addFields(fields);

		if (!onlyRaidDays)
			embed.setDescription('Please do tell when there is a day that you dont have time so we can adjust the schedule')
				.setFooter({ text: 'The Time is in Server Time (ST) / UTC' });

		await interaction.reply({ embeds: [embed] })
			.catch(err => console.error(err));
	},
};

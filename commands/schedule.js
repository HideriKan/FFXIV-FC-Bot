const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock } = require('discord.js');
const RaidWeek = require('../Classes/RaidWeek');
const RaidDay = require('../Classes/RaidDay');
const { getStartingDay, getRaidDayFromString, getEventChannels, capitalizeFirstLetter } = require('../utility');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Create or edit a schedule for your raid')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.addSubcommand(subcmd => subcmd.setName('create') // next, batch
			.setDescription('Creates a new Schedule for the raid command to be displayed')
			.addBooleanOption(opt => opt.setName('next')
				.setDescription('Edit current week?')
				.setRequired(true))
			.addStringOption(opt => opt.setName('batch')
				.setDescription('Add week times in Tu/We/Th/Fr/Sa/Su/Mo')
				.setRequired(true))
		)
		.addSubcommand(subcmd => subcmd.setName('edit') // raidday, [time, day]
			.setDescription('Edits a singular raid day from the schedule')
			.addStringOption(opt => opt.setName('raidday')
				.setDescription('The raid day that you want to change the status of')
				.setRequired(true)
				.addChoices(
					{ name: 'Tue', value: '0' },
					{ name: 'Wed', value: '1' },
					{ name: 'Thu', value: '2' },
					{ name: 'Fri', value: '3' },
					{ name: 'Sat', value: '4' },
					{ name: 'Sun', value: '5' },
					{ name: 'Mon', value: '6' }
				)
			)
			.addStringOption(opt => opt.setName('time')
				.setDescription('(Optional) The new ST. Leave empty for no raid. Does not create a raid day!')
			)
			.addStringOption(opt => opt.setName('day')
				.setDescription('(Optional) The new raid day you want to move it to')
				.addChoices(
					{ name: 'Tue', value: '0' },
					{ name: 'Wed', value: '1' },
					{ name: 'Thu', value: '2' },
					{ name: 'Fri', value: '3' },
					{ name: 'Sat', value: '4' },
					{ name: 'Sun', value: '5' },
					{ name: 'Mon', value: '6' }
				)
			)
		)
	,
	/**
	 * createschedule will take a true or false if the new schedule is for the current week or the next one.
	 * the other argument will be the batch which contain the string array of the raid times
	 * @param {import('discord.js').Interaction} interaction message interaction
	 */
	async execute(interaction) {
		const cmd = interaction.options.getSubcommand();

		switch (cmd) {
		case 'create':
			create(interaction);
			break;
		case 'edit':
			edit(interaction);
			break;
		}
	},
};

async function create(interaction) {
	// get user option
	const editNext = interaction.options.getBoolean('next');
	const batch = interaction.options.getString('batch');
	// process user batch
	let batchArr = batch.split('/');

	// reduce the array when its too big
	if (batchArr.length > 7)
		batchArr = batchArr.slice(0, 7);

	// fill the array when its to small
	while (batchArr.length < 7)
		batchArr.push('');

	const raidWeek = new RaidWeek();
	const row = new ActionRowBuilder();
	const staticChannels = getEventChannels();
	staticChannels.forEach(channel => {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(channel.type)
				.setLabel(capitalizeFirstLetter(channel.type))
				.setStyle(ButtonStyle.Secondary)
		);
	});

	if (editNext) // when the user is chosing a next week
		raidWeek.startingWeekDay = getStartingDay(true);

	raidWeek.newDaysFromBatch(batchArr);
	raidWeek.writeJson();

	// check if the guild has scheduled events for the raid
	const events = await interaction.guild.scheduledEvents.fetch();
	const filterdEvents = events.filter(eve => eve.name === 'Raid' && eve.description === 'Raid Time');
	if (filterdEvents.size > 0)
		filterdEvents.forEach(event => event.delete());

	interaction.reply({ content: 'New Times have been saved', components: [row] });

}

async function edit(interaction) {
	// get user options
	const index = Number(interaction.options.getString('raidday')); // selected day
	const time = interaction.options.getString('time'); // move time to this
	const userDay = interaction.options.getString('day'); // it kinda makes sence that null gets translated to 0 but I thought it would convert it to NaN
	const newIndex = userDay === null ? NaN : Number(userDay); // move day to this
	let content;

	// read the raid day to be changed
	const raidWeek = new RaidWeek();
	raidWeek.readJson();
	const rDay = raidWeek.week[index];

	// check if the choosen day has a raid
	if (!rDay.isRaid) {
		interaction.reply({ content: 'There is no raid on your choosen date you can only edit a raid day. \nIf you want to create a raid day use `\\schedule create`' });
		return;
	}

	const rDayTime = new Date(rDay.startTime);
	content = `${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(rDayTime)} `;

	// get the event for that raid day
	const events = await interaction.guild.scheduledEvents.fetch({ name: 'Raid', scheduledStartTimestamp: rDayTime.getTime() }); // Test: if this works
	const event = events.size >= 1 ? events.first() : null;
	let debugMessage = `\nDebug: Found more then 1 event with ${rDayTime.getTime()}`;
	events.forEach(eve => { debugMessage += '\n' + codeBlock(`Name: ${eve.name}\nDescription: ${eve.description}\nDate: ${eve.scheduledStartAt}`); });

	// Get a new day with the new time
	const newDay = getRaidDayFromString(time === null ? '' : time, rDay.day);

	if (time === null && Number.isNaN(newIndex)) { // No time and no new day has been passed
		raidWeek.week[index] = newDay;

		content += 'No Raid';
		if (event !== null) // if an event was found - delete it
			event.delete();

		content += 'has been updated to no raid';
	} else if (!Number.isNaN(newIndex)) { // a new day has bee passed
		if (new Date() > raidWeek.week[newIndex].day) { // When the current date is higher (older) then the target date (it's in the past); cancel
			interaction.reply({ content: 'Cannot move the event into the past' });
			return;
		}

		if (time !== null) // gave time
			raidWeek.week[index] = newDay;

		if (raidWeek.week[index].isRaid) { // move selected day to the new one
			const newIDay = new Date(raidWeek.week[newIndex].day);
			newIDay.setHours(rDayTime.getHours());
			newIDay.setMinutes(rDayTime.getMinutes());

			raidWeek.week[newIndex].isRaid = true;
			raidWeek.week[newIndex].startTime = newIDay;
			raidWeek.week[newIndex].endTime = raidWeek.week[index].endTime;
			raidWeek.week[index] = new RaidDay(raidWeek.week[index].day);
		}

		if (event !== null) // adjust the scheduled event
			event.setScheduledStartTime(raidWeek.week[newIndex].startTime);


		content += `has been moved to ${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(raidWeek.week[newIndex].day))}`;
		if (time !== null) {
			const newDayTime = new Date(newDay.startTime);
			content += ` with the time ${newDayTime.getUTCHours()}:${newDayTime.getUTCMinutes() === 0 ? '00' : newDayTime.getUTCMinutes()}`;
		}
	} else if (time !== null) { // gave time but no new date
		raidWeek.week[index] = newDay;

		if (event !== null) // adjust the scheduled event
			event.setScheduledStartTime(newDay.startTime);

		const newDayTime = new Date(newDay.startTime);
		content += `has been updated from ${rDayTime.getUTCHours()}:${rDayTime.getUTCMinutes() === 0 ? '00' : rDayTime.getUTCMinutes()} to ${newDayTime.getUTCHours()}:${newDayTime.getUTCMinutes() === 0 ? '00' : newDayTime.getUTCMinutes()}`;
	}

	// save the new raid day to the file
	raidWeek.writeJson();

	if (events.size > 1)
		content += debugMessage;
	interaction.reply({ content: content });
}
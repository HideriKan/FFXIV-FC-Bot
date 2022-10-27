const { GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');
const fs = require('fs');

/**
 * Returns the day of the reset in FFXIV (Tuesday)
 * @returns True current week Date (of Tuesday)
 */
function getStartingDay(isNextWeek = false) { // ++ or --
	const direction = isNextWeek ? 1 : -1;
	const now = new Date(Date.now());

	while (now.getUTCDay() != 2) { // 2 is Thuesday
		now.setUTCDate(now.getUTCDate() + direction);
	}

	return now;
} // End of getStartingDay


const staticChannels = [{ id: '968545420198416397', type: 'ult' }, { id: '1012614749378326609', type: 'savage' }];
/**
 * 
 * @param {import('discord.js').MessageComponentInteraction} interaction 
 * @param {RaidWeek} raidWeek 
 * @returns void
 */
async function createScheduledEvents(interaction, raidWeek) {
	if (!interaction.guild.available)
		return;

	const channel = staticChannels.find(keyValue => keyValue.type === interaction.customId);

	raidWeek.readJson();
	raidWeek.keepOnlyRaidDays();

	raidWeek.week.forEach(day => {
		const start = new Date(day.startTime).getTime();

		interaction.guild.scheduledEvents.create({
			name: new Date(day.day).toDateString(),
			description: 'Raid Time',
			scheduledStartTime: start,
			privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
			entityType: GuildScheduledEventEntityType.Voice,
			channel: channel.id
		});
	});

	interaction.update({ content: 'Guild Events have been added', components: [] });
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 */
async function assingToMember(interaction) {
	console.log(interaction);
	interaction.update({ content: 'Updated', components: [] });
}

/**
 * 
 * @param {String} fileName path to the file
 * @returns true if already exisits, otherwise false and creates the file
 */
function fileExists(fileName) {
	try {
		if (!fs.existsSync(fileName)) {
			fs.writeFile(fileName, '', err => { if (err) console.error(err); });
			return false;
		}

		return true;
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	getStartingDay,
	createScheduledEvents,
	assingToMember,
	fileExists
}; 

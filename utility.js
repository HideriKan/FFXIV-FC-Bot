const { GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');
const RaidDay = require('./Classes/RaidDay');

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

/**
 * Will convert any time format be it XX / XXXX / XX:XX or empty
 * @param {String} timeStr user input from command
 * @param {Date} raidDate date of the raidDay
 * @returns {RaidDay} adjusted raidDay
 */
function getRaidDayFromString(timeStr, raidDate) {
	const ownDate = new Date(raidDate);
	const rDay = new RaidDay(ownDate);
	let isDateSet = false;
	timeStr.trim();

	if (!isNaN(timeStr) || timeStr.includes(':')) {

		if (timeStr.length === 2 && timeStr != '00') {
			ownDate.setUTCHours(timeStr, 0);
			isDateSet = true;

		} else if (timeStr.length === 4) {
			ownDate.setUTCHours(timeStr.substring(0, 2), timeStr.substring(2));
			isDateSet = true;

		} else if (timeStr.length === 5) {
			let arrTimes = timeStr.split(':');

			if (!isNaN(arrTimes[0]) && !isNaN(arrTimes[1])) {
				ownDate.setUTCHours(arrTimes[0], arrTimes[1]);
				isDateSet = true;
			}
		}

		if (isDateSet) {
			rDay.isRaid = true;
			rDay.startTime = ownDate.toJSON();
		}

	}

	return rDay;
}

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
	const now = new Date();

	raidWeek.readJson();
	raidWeek.keepOnlyRaidDays();

	raidWeek.week.forEach(day => {
		const start = new Date(day.startTime)
		if (start > now)
			interaction.guild.scheduledEvents.create({
				name: new Date(day.day).toDateString(),
				description: 'Raid Time',
				scheduledStartTime: start.getTime(),
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

module.exports = {
	getStartingDay,
	getRaidDayFromString,
	createScheduledEvents,
	assingToMember
}; 

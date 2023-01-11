const { GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');
const RaidDay = require('./Classes/RaidDay');

/**
 * Returns the day of the reset in FFXIV (Tuesday)
 * @param {Boolean} isNextWeek determins if the start of the week is the current one or the next week
 * @returns starting week date of FFXIV (Tuesday)
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


/**
 * simple function to get the hardcoded channels
 * TODO: config command?
 * @returns Array with the id and the name of the bound channels
 */
function getEventChannels() {
	const staticChannels = [{ id: '968545420198416397', type: 'ult' }, { id: '1012614749378326609', type: 'savage' }];
	return staticChannels;
}

/**
 * Creates scheduled guild events for a specific channel from a raidweek 
 * @param {import('discord.js').MessageComponentInteraction} interaction 
 * @param {RaidWeek} raidWeek 
 */
async function createScheduledEvents(interaction, raidWeek) {
	if (!interaction.guild.available)
		return;

	const staticChannels = getEventChannels();
	const channel = staticChannels.find(keyValue => keyValue.type === interaction.customId);
	const now = new Date();

	raidWeek.readJson();
	raidWeek.keepOnlyRaidDays();

	raidWeek.week.forEach(day => {
		const start = new Date(day.startTime)
		if (start > now)
			interaction.guild.scheduledEvents.create({
				name: 'Raid',
				description: 'Raid Time',
				scheduledStartTime: start.getTime(),
				privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
				entityType: GuildScheduledEventEntityType.Voice,
				channel: channel.id
			});
	});

	interaction.update({ content: 'Guild Events have been added', components: [] });
}

module.exports = {
	getStartingDay,
	getRaidDayFromString,
	createScheduledEvents
}; 

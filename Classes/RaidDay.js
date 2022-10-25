const { time } = require('discord.js');
/**
 * Manages the day of a Raid
 */
class RaidDay {
	/**
	 * Takes the Days and sets it as that day with some initial values
	 * @param {Date} day acts as the Initial value and set it to the given date
	 */
	constructor(day) {
		this.day = day;
		this.isRaid = false;
		this.startTime = '';
		this.endTime = '';
	}

	/**
	 * A Simple parse.
	 * @returns An object for the EmbedBuilder.addFields()
	 */
	toField() {
		let tDate = new Date(this.day);
		let sDate = new Date(this.startTime);
		let dFormat = new Intl.DateTimeFormat('en', {
			day: '2-digit',
			month: 'short',
			weekday: 'short',
			timeZone: 'UTC'
		});

		let field = {
			name: dFormat.format(tDate),
			inline: true
		};

		if (this.isRaid)
			field = { value: `At: ${time(sDate, 't')}, ${time(sDate, 'R')}`, }
		else
			field = { value: 'No Raid' };

		return field;
	} // End of toField

} // End of RaidDay

module.exports = RaidDay;

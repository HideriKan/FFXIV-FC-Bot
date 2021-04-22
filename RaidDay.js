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
	 * @returns An object for the MessageEmbeds.addField()
	 */
	toField() {
		let tDate = new Date(this.day);
		let sDate = new Date(this.startTime);
		let tFormat = new Intl.DateTimeFormat('de', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'UTC'
			// timeZoneName: 'short'
		});
		let dFormat = new Intl.DateTimeFormat('en', {
			day: '2-digit',
			month: 'short',
			weekday: 'short',
			timeZone: 'UTC'
		});
		let field = {};

		if (this.isRaid) {
			field = {
				name: dFormat.format(tDate),
				value: 'Start: ' + tFormat.format(sDate) + ' ST',
				// +'\nEnd: ' + tFormat.format(eDate),
				inline: true
			};
		} else {
			field = {
				name: dFormat.format(tDate),
				value: 'No Raid',
				inline: true
			};
		}

		return field;
	} // End of toField

} // End of RaidDay

module.exports = RaidDay;
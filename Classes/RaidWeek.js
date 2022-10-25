// Imports
const RaidDay = require('./RaidDay');
const fs = require('fs');
const { getStartingDay, getRaidDayFromString } = require('../utility');

// File settings
const jsonFile = './RaidTimes.json';

/**
 * Manages the whole raid week with an array of RaidDays. 
 */
class RaidWeek {
	/**
	 * The Weekly reset for FFXIV is every tuesday so it the date parsed should be that.
	 */
	constructor() {
		this.startingWeekDay = getStartingDay();
		this.week = [];
	}

	async newDaysFromBatch(batchArr) {
		const lastDate = new Date(this.startingWeekDay);

		batchArr.forEach(time => {
			this.week.push(getRaidDayFromString(time, lastDate));
			lastDate.setDate(lastDate.getDate() + 1);
		});
	}

	/**
	 * Creates the data for the week by asking the user for each day.
	 * An Asyncronos func because it is needed to await the respnse from the user.
	 * @param {Message} msg To read the contents of the User
	 * @deprecated this doesnt get used anymore
	 */
	keepOnlyRaidDays() {
		this.week = this.week.filter(day => day.isRaid);
	}

	/**
	 * Reads the defual json file and fills this raidweek
	 */
	readJson() {
		try {
			const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

			this.startingWeekDay = data.startingWeekDay;
			this.week = [];

			data.week.forEach(dataDay => {
				let newDay = new RaidDay(dataDay.day);
				newDay.isRaid = dataDay.isRaid;
				newDay.startTime = dataDay.startTime;
				newDay.endTime = dataDay.endTime;

				this.week.push(newDay);
			});
			return;

		} catch (err) {
			console.error(err);
		} // End of try-catch
	} // End of readJson

	/**
	 * Simple function that writes the whole contents of the RaidWeek into a JSON file
	 */
	writeJson() {
		// fs.writeFile(jsonFile, JSON.stringify(this, null, 2), err => {
		// 	if (err) return console.error(err);
		// 	console.log('saved RaidWeek');
		// });
		try {
			fs.writeFileSync(jsonFile, JSON.stringify(this, null, 2));
		} catch (err) {
			if (err) return console.error(err);
		} // End of try-catch

	} // End of writeJson

} // End RaidWeek

module.exports = RaidWeek;
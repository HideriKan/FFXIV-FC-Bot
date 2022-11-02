const RaidDay = require('./RaidDay');
const fs = require('fs');
const { getStartingDay, getRaidDayFromString } = require('../utility');


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

	/** relative path to the file */
	static fileName = './RaidTimes.json';

	/**
	 * generates a raid week from a batch of raid times
	 * @param {String[]} batchArr array of times
	 */
	async newDaysFromBatch(batchArr) {
		const lastDate = new Date(this.startingWeekDay);

		batchArr.forEach(time => {
			this.week.push(getRaidDayFromString(time, lastDate));
			lastDate.setDate(lastDate.getDate() + 1);
		});
	}

	/**
	 * filters out the non raid days from the week
	 */
	keepOnlyRaidDays() {
		this.week = this.week.filter(day => day.isRaid);
	}

	/**
	 * Reads the defual json file and fills this raidweek with its content
	 */
	readJson() {
		try {
			const data = JSON.parse(fs.readFileSync(RaidWeek.fileName, 'utf8'));

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
	 * writes the raid week into a formatted json file
	 */
	writeJson() {
		try {
			fs.writeFileSync(RaidWeek.fileName, JSON.stringify(this, null, 2));
		} catch (err) {
			if (err) return console.error(err);
		} // End of try-catch

	} // End of writeJson

} // End RaidWeek

module.exports = RaidWeek;
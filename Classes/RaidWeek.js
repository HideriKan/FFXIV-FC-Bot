const RaidDay = require('./RaidDay');
const { getStartingDay, getRaidDayFromString } = require('../utility');
const fm = require('./FileManager');

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
		const data = JSON.parse(fm.readFile(fm.dir.DATA, RaidWeek.fileName));

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
	} // End of readJson

	/**
	 * writes the raid week into a formatted json file
	 */
	writeJson() {
		fm.writeFile(fm.dir.DATA, RaidWeek.fileName, JSON.stringify(this, null, 2));
	} // End of writeJson

} // End RaidWeek

module.exports = RaidWeek;
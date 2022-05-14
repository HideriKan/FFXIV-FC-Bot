// Imports
const RaidDay = require('./RaidDay');
const fs = require('fs');
const { Message } = require('discord.js'); // eslint-disable-line no-unused-vars
const getStartingDay = require('./utility');
// const { timeStamp } = require('console');
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

		batchArr.forEach(times => {
			let isDateSet = false;
			const lDate = new Date(lastDate);
			const rDay = new RaidDay(lDate);
			times.trim();

			if (!isNaN(times) || times.includes(':')) {

				if(times.length === 2 && times != '00') {
					lastDate.setUTCHours(times, 0);
					isDateSet = true;
					
				} else if (times.length === 4) {
					lastDate.setUTCHours(times.substring(0,2), times.substring(2));
					isDateSet = true;
				
				} else if (times.length === 5) {
					let arrTimes = times.split(':');
					
					if (!isNaN(arrTimes[0]) && !isNaN(arrTimes[1])) {
						lastDate.setUTCHours(arrTimes[0], arrTimes[1]);
						isDateSet = true;
					
					}
				}

				if (isDateSet) {
					rDay.isRaid = true;
					rDay.startTime = lastDate.toJSON();
				}
					
			}

			this.week.push(rDay);
			lastDate.setDate(lastDate.getDate() + 1);
		});
	}

	/**
	 * Creates the data for the week by asking the user for each day.
	 * An Asyncronos func because it is needed to await the respnse from the user.
	 * @param {Message} msg To read the contents of the User
	 * @deprecated this doesnt get used anymore
	 */
	async newDays(msg) {
		const filterYN = msg => {
			if (msg.content.toLowerCase() === 'y' || msg.content.toLowerCase() === 'n') return true;
			return false;
		};
		const filterTimeOrY = msg => {
			if (regex.test(msg.content) || msg.content.toLowerCase() === 'y' ) return true;
			return false;
		};
		const filterIsBatch = msg => {
			// MO/TH/WE/TU/FR/SA/SO (6 x /)
			if (msg.content.toLowerCase().includes('/') && !msg.author.bot) return true;
		};
		const lastDate = new Date(this.startingWeekDay);
		const shortDay = new Intl.DateTimeFormat('en', {
			weekday: 'long', 
			month: 'short',
			day: '2-digit',
			timeZone: 'UTC'
		});
		const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g; //used to test a valid time
		this.week = [];
		let fail = false;
		let userMsg;
		let userTime;
		
		msg.channel.send('Is batch input? Y / N');
		await msg.channel.awaitMessages({filterYN, max: 1, time: 30000, errors: ['time']})
			.then(col=> userMsg = col.first())
			.catch(()=> {
				msg.reply('Ya Took too long');
				fail = true;
			});
			
		if (fail) return;
		if (userMsg.content.toLowerCase() == 'y') {
			msg.channel.send('Gimmi Batch e.g.: `MO/TU/WE/TH/FR/SA/SU` => `/17:30//19///1835`');
			await msg.channel.awaitMessages({filterIsBatch, max: 1, time: 30000, errors: ['time']})
				.then(col=> userMsg = col.first())
				.catch(()=> {
					msg.reply('Ya Took too long');
					fail = true;
				});

			let arr = userMsg.content.split('/');

			arr.forEach(times => {
				let isDateSet = false;
				const lDate = new Date(lastDate);
				const rDay = new RaidDay(lDate);
				times.trim();

				if (!isNaN(times) || times.includes(':')) {

					if(times.length === 2 && times != '00') {
						lastDate.setUTCHours(times, 0);
						isDateSet = true;
						
					} else if (times.length === 4) {
						lastDate.setUTCHours(times.substring(0,2), times.substring(2));
						isDateSet = true;
					
					} else if (times.length === 5) {
						let arrTimes = times.split(':');
						
						if (!isNaN(arrTimes[0]) && !isNaN(arrTimes[1])) {
							lastDate.setUTCHours(arrTimes[0], arrTimes[1]);
							isDateSet = true;
						
						}
					}

					if (isDateSet) {
						rDay.isRaid = true;
						rDay.startTime = lastDate.toJSON();
					}
						
				}

				this.week.push(rDay);
				lastDate.setDate(lastDate.getDate() + 1);
			});
		} else if(userMsg.content.toLowerCase() == 'n') {
			for (let i = 0; i < 7; i++) {
				const lDate = new Date(lastDate);
				const rDay = new RaidDay(lDate);
				
				// Asking the user if there is raid on xyz date
				msg.channel.send('Is Raid on ' + shortDay.format(lDate) + 
				// lDate.getDate() + '.' + (lDate.getUTCMonth() + 1) + 
				' (y = Yes | n = No)');
				await msg.channel.awaitMessages({filterYN, max: 1, time: 30000, errors: ['time']})
					.then(col => userMsg = col.first())
					.catch(() => {
						msg.reply('Ya Took too long');
						fail = true; // cannot return in a promise
					});

				if (fail) return;

				switch (userMsg.content.toLowerCase()) {
				case 'y':
					rDay.isRaid = true;
					break;
				case 'n':
					this.week.push(rDay);
					lastDate.setUTCDate(lastDate.getUTCDate() + 1);
					continue;
				}

				// Asking the use what the stating time is with the valid format
				msg.channel.send('What Time does it start (hh:mm or \'Y\' for 18:00)'); 
				await msg.channel.awaitMessages({filterTimeOrY, max: 1, time: 30000, errors: ['time']})
					.then(col => userMsg = col.first())
					.catch(() => {
						msg.reply('Ya Took too long');
						fail = true; // cannot return in a promise
					});

				if (fail) return;

				if (userMsg.content == 'y') {
					userTime = ['18', '00'];
				} else {
					userTime = userMsg.content.split(':'); // Its gonna be an Array with [hh, mm]
				}
					
				lastDate.setUTCHours(userTime[0], userTime[1]);
				rDay.startTime = lastDate.toJSON();

				this.week.push(rDay);
				lastDate.setUTCDate(lastDate.getUTCDate() + 1);
			} // end of for loop 
		}

	} // end of newDays

	/**
	 * Reads the date from the json file and turns is into a RaidWeek with an array of RaidDays
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
// Imports
const { Client, MessageEmbed, Message } = require('discord.js'); // eslint-disable-line no-unused-vars
const client = new Client();
const RaidWeek = require('./RaidWeek.js');
// File settings
const { token, prefix, userID } = require('./config.json');
// Globals
let g_RaidWeek = new RaidWeek(getStartingDay());

/**
 * Returns the day of the reset in FFXIV (Tuesday)
 * @param {Boolean} isNext determinds the direction of the search. True this week, False next week
 * @returns Date (a Tuesday)
 */
function getStartingDay(isNext = false) { // ++ or --
	const direction = isNext ? 1 : -1;
	const now = new Date(Date.now());

	while (now.getUTCDay() != 2) { // 2 is Thuesday
		now.setUTCDate(now.getUTCDate() + direction);
	}

	return now;
} // End of getStartingDay

/**
 * Function of the Raid Command
 * Sends an Embed with the raid times into the corresponding channel
 * @param {Message} msg used to send the message to the channle
 * @param {Array} args optional
 * @argument pin Will pin the post afterwards
 * @argument ro (Raidonly) Will only show the days when there is raid
 * @argument ping Will ping the raid role
 */
function postRaidTimes(msg, args = []) {
	let dFormat = new Intl.DateTimeFormat('de', {
		month: '2-digit',
		day: '2-digit',
		timeZone: 'UTC'
	});

	let toPin = false;
	let onlyRaidDays = false;
	let ping = false;
	let fields = [];
	let fWeek = [];
	let dateRange = '';

	args.forEach(arg => {
		if (arg.toLowerCase() === 'pin' && msg.member.permissions.has('MANAGE_MESSAGES') || msg.channel.type === 'dm') 
			toPin = true;
		if (arg.toLowerCase() === 'ro') 
			onlyRaidDays = true;
		if (arg.toLowerCase() === 'ping' && msg.author.id === userID) 
			ping = true;
	});
	
	g_RaidWeek.readJson();

	if (onlyRaidDays) {
		fWeek = g_RaidWeek.week.filter(day => day.isRaid);
		fWeek.forEach(day => {
			fields.push(day.toField());
		});

	} else {
		g_RaidWeek.week.forEach(day => {
			fields.push(day.toField());
		});
	} // End of if else

	const test = new Date(g_RaidWeek.startingWeekDay);
	dateRange = dFormat.format(test) + ' ~ ' + dFormat.format(test.setDate(test.getDate()+7));

	const embed = new MessageEmbed()
		.setTitle('Raid Schedule (' + dateRange + ')')
		.setDescription('Please do tell me when there is a day that you dont have time so I can adjust the schedule')
		.setColor('LUMINOUS_VIVID_PINK')
		.setFooter('The Time is now in Server Time (ST) / UTC so dont get confused')
		.addFields(fields);

	if (ping) embed.setDescription('<@&474529221864062989> Please do tell me when there is a day that you dont have time so I can adjust the schedule');

	msg.channel.send(embed)
		.then(msg => {
			if (toPin) msg.pin();
		})
		.catch(err => console.error(err));

} // End of postRaidTimes

/**
 * Function of the Create Times (ct) Command
 * Create or Adjust the Raid times
 * @param {Message} msg 
 */
async function createTimes(msg) { // might change name to times init and call newTimes() or adjustTime()
	let filter = msg => {
		if (msg.content.toLowerCase() === 'a' || msg.content.toLowerCase() === 'n') return true;
		return false;
	};
	let fail = false;
	let userMsg;

	// Asking if its the current or make a new schedule
	msg.channel.send('Adjust the current week schedule or create one for next week? (a = This week | n = New Week )');
	await msg.channel.awaitMessages(filter, {max: 1, time: 30000, errors: ['time']})
		.then(col => userMsg = col.first())
		.catch(() => {
			msg.reply('Ya Took too long');
			fail = true;
		});

	if (fail) return;

	switch (userMsg.content.toLowerCase()) {
	// case 'a':
	// 	break;
	case 'n':
		g_RaidWeek.startingWeekDay = getStartingDay(true);
		break;
	}
	
	await g_RaidWeek.newDays(msg);
	g_RaidWeek.writeJson();
	msg.reply('New Times have been saved');
	postRaidTimes(msg); // TODO: use as a prevew and save after

} // End of createTimes

client
	.once('ready', () => {
		console.log(`Logged in as ${client.user.tag}!`);
	}) // End of once ready
	.on('message', msg => {
		try {
			if (!msg.content.startsWith(prefix) || msg.author.bot) return; // checks if it starts with the prefix

			const args = msg.content.slice(prefix.length).trim().split(/ +/); // collects the arguments
			const command = args.shift().toLowerCase(); // gets just the command name

			if (command === 'raid') postRaidTimes(msg, args);
			if (command === 'ct' && msg.channel.type === 'dm' && msg.author.id === userID) createTimes(msg);
		} catch (error) {
			msg.reply('Something went wrong, please check the Logs..');
			console.error(error);
		}
	}); // End of on message

client.login(token);
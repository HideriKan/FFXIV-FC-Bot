const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	/**
	 * Module for the ready discord event
	 * @param {import('discord.js').Client} client 
	 */
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

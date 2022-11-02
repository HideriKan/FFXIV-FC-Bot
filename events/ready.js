const { Client } = require("discord.js");

module.exports = {
	name: 'ready',
	once: true,
	/**
	 * Module for the ready discord event
	 * @param {Client} client 
	 */
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

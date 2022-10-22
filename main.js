// Imports
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('node:fs');

// configs
const { token, isBeta, tokenBeta } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

// add commands dynamicly 
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// add client events dynamicly 
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once)
		client.once(event.name, (...args) => event.execute(...args));
	else
		client.on(event.name, (...args) => event.execute(...args));
}

client.login(isBeta ? tokenBeta : token);
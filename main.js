const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fm = require('./Classes/FileManager');
const { token, tokenBeta, isBeta } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

// add commands dynamicly 
client.commands = new Collection();
const commandFiles = fm.readDir('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// add client events dynamicly 
const eventFiles = fm.readDir('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once)
		client.once(event.name, (...args) => event.execute(...args));
	else
		client.on(event.name, (...args) => event.execute(...args));
}

client.login(isBeta ? tokenBeta : token);
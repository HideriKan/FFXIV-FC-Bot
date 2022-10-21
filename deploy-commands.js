// Discord Js require
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
// Config
const { clientId, guildId, token } = require('./config.json'); // eslint-disable-line no-unused-vars

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

const isGlobal = false;
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		let data;
		if (isGlobal) {
			data = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);
		} else {
			data = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);
	
		}

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
// rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands })
// rest.put(Routes.applicationCommands(clientId), {body: commands })
// 	.then(() => console.log('Successfully registered applicaion commands.'))
// 	.catch(console.error());
const ItemManager = require('../Classes/ItemManager');
const Member = require('../Classes/Member');
const RaidWeek = require('../Classes/RaidWeek');
const { createScheduledEvents } = require('../utility');

module.exports = {
	name: 'interactionCreate',
	/**
	 * 
	 * @param {import("discord.js").Interaction} interaction 
	 */
	async execute(interaction) {
		try {

			if (interaction.isButton()) {
				if (interaction.customId === 'savage' || interaction.customId === 'ult')
					await createScheduledEvents(interaction, new RaidWeek());
				else if (interaction.customId === 'yesitem')
					await new ItemManager(ItemManager.itemTypeFromMessage(interaction.message.content)).assingItemToMember(interaction);
				else if (interaction.customId === 'yesrem')
					await Member.removeUserFromFile(interaction);
				else if (interaction.customId === 'no')
					interaction.update({ content: 'Command has been canceled', components: [] });
			}

			else if (interaction.isCommand()) {
				const command = interaction.client.commands.get(interaction.commandName);
				if (!command) return;

				await command.execute(interaction);
			}

		} catch (error) {
			console.error(error);

			if (interaction.deferred && !interaction.replied)
				await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
			else if (!interaction.replied)
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};
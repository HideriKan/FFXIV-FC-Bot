const ItemManager = require('../Classes/ItemManager');
const Member = require('../Classes/Member');
const RaidWeek = require('../Classes/RaidWeek');
const { createScheduledEvents, getEventChannels, sendGriefToChannel } = require('../utility');

module.exports = {
	name: 'interactionCreate',
	/**
	 * Module for the interactionCreate discord event
	 * @param {import("discord.js").Interaction} interaction 
	 */
	async execute(interaction) {
		try {
			if (interaction.isButton()) {

				if (getEventChannels().map(item => item.type).includes(interaction.customId))
					await createScheduledEvents(interaction, new RaidWeek());
				else if (interaction.customId === 'yesitem')
					await new ItemManager(ItemManager.itemTypeFromMessage(interaction.message.content)).assingItemToMember(interaction);
				else if (interaction.customId === 'yesrem')
					await Member.removeMemberFromFile(interaction);
				else if (interaction.customId === 'yesreset')
					await Member.resetMemberFromFile(interaction);
				else if (interaction.customId === 'no')
					interaction.update({ content: 'Command has been canceled', components: [] });

			} else if (interaction.isCommand()) {

				const command = interaction.client.commands.get(interaction.commandName);
				if (!command) return;

				await command.execute(interaction);

			} else if (interaction.isModalSubmit()) {

				if (interaction.customId === 'griefpaper')
					await sendGriefToChannel(interaction);

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
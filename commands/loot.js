const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const Member = require('../Classes/Member');

function got(user, type) {
	const reply = { content: null, components: null, ephemeral: true };
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('yes')
				.setLabel('Yes')
				.setStyle(ButtonStyle.Primary)
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('no')
				.setLabel('No')
				.setStyle(ButtonStyle.Danger)
		);

	reply.content = `Give ${user} an item type of "${type}"?`;
	reply.components = [row];

	return reply;
}

function show(type) {
	const reply = { content: null, components: null, ephemeral: true };

	reply.content = `The show with options: "${type}" is a WIP command`;
	return reply;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loot')
		.setDescription('Loot tracker')
		.addSubcommand((subcmd) =>
			subcmd
				.setName('got') // opt: [user, type]
				.setDescription('Distrubte loot for a raid member')
				.addUserOption((opt) =>
					opt
						.setName('user')
						.setDescription('who got the loot')
						.setRequired(true)
				)
				.addStringOption((opt) =>
					opt
						.setName('type')
						.setDescription('Item Type')
						.setRequired(true)
						.addChoices(
							{ name: 'Gear', value: 'gear' },
							{ name: 'Weapon', value: 'weap' },
							{ name: 'Body', value: 'body' },
							{ name: 'Tome Weapon', value: 'tomeWeap' },
							{ name: 'Tome Weapon Upgrade', value: 'tomeUp' },
							{ name: 'Tome Gear Upgrade', value: 'gearUp' },
							{ name: 'Tome Accessory Upgrade', value: 'accUp' },
							{ name: 'Priority', value: 'prio' }
						)
				)
		)
		.addSubcommand((subcmd) =>
			subcmd
				.setName('show') // opt: type
				.setDescription('Show who can roll / priority')
				.addStringOption((opt) =>
					opt
						.setName('type')
						.setDescription('Item Type')
						.setRequired(true)
						.addChoices(
							{ name: 'Gear', value: 'gear' },
							{ name: 'Weapon', value: 'weap' },
							{ name: 'Body', value: 'body' },
							{ name: 'Tome Weapon', value: 'tomeWeap' },
							{ name: 'Tome Weapon Upgrade', value: 'tomeUp' },
							{ name: 'Tome Gear Upgrade', value: 'gearUp' },
							{ name: 'Tome Accessory Upgrade', value: 'accUp' }
						)
				)
		),
	/**
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const cmd = interaction.options.getSubcommand();
		const type = interaction.options.getString('type');
		const user = interaction.options.getUser('user');

		let reply;
		switch (cmd) {
			case 'got':
				reply = got(user, type);
				break;
			case 'show':
				reply = show(type);
				break;
		}

		interaction.editReply(reply);
	},
};

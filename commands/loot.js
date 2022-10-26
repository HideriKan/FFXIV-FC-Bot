const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, } = require('discord.js');
const Member = require('../Classes/Member');

/**
 * processes the loot got command
 * @param {User} user mentioned user
 * @param {string} type item type
 * @returns reply as an object
 */
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

	const member = new Member(user.nickname, user.id);
	member.saveMember();

	reply.content = `Give ${user} an item type of "${type}"?`;
	reply.components = [row];

	return reply;
}

/**
 * processes the loot show command
 * @param {string} type item type
 */
function show(type) {
	const reply = { content: null, components: null, ephemeral: true };

	reply.content = `The show with options: "${type}" is a WIP command`;
	return reply;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loot')
		.setDescription('Loot tracker')
		.addSubcommand((subcmd) => subcmd.setName('got') // opt: [user, type]
			.setDescription('Distrubte loot for a raid member')
			.addUserOption((opt) => opt.setName('user')
				.setDescription('who got the loot')
				.setRequired(true)
			)
			.addStringOption((opt) => opt.setName('type')
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
		.addSubcommand((subcmd) => subcmd.setName('show') // opt: type
			.setDescription('Show who can roll / priority')
			.addStringOption((opt) => opt.setName('type')
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
	 * @param {import('discord.js').Interaction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const cmd = interaction.options.getSubcommand();

		let reply;
		switch (cmd) {
			case 'got':
				reply = got(interaction.options.getUser('user'), interaction.options.getString('type'));
				break;
			case 'show':
				reply = show(interaction.options.getString('type'));
				break;
		}

		interaction.editReply(reply);
	},
};

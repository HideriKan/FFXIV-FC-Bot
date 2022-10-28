const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, PermissionFlagsBits, bold, } = require('discord.js');
const ItemManager = require('../Classes/ItemManager');

/**
 * processes the loot got command
 * @param {GuildMember} user mentioned user
 * @param {string} type item type
 * @returns reply as an object
 */
function giveBtn(user, type) {
	const reply = { content: null, components: null, ephemeral: true };
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('yesitem')
				.setLabel('Yes')
				.setStyle(ButtonStyle.Primary)
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('no')
				.setLabel('No')
				.setStyle(ButtonStyle.Danger)
		);
	

	reply.content = `Give ${bold(ItemManager.fromItemValue(type).name)} to ${user}`;
	reply.components = [row];

	return reply;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loot')
		.setDescription('Loot tracker')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addSubcommand((subcmd) => subcmd.setName('give') // opt: [user, type]
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
		const itemMgr = new ItemManager(interaction.options.getString('type'));

		let reply;
		switch (cmd) {
			case 'give':
				reply = giveBtn(interaction.options.getMember('user'), interaction.options.getString('type'));
				break;
			case 'show':
				reply = itemMgr.generateData();
				break;
		}

		interaction.editReply(reply);
	},
};

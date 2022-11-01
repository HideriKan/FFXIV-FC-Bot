const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, PermissionFlagsBits, bold, } = require('discord.js');
const ItemManager = require('../Classes/ItemManager');
const Member = require('../Classes/Member');

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
		.addSubcommand(subcmd => subcmd.setName('give') // opt: [user, type]
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
		.addSubcommand(subcmd => subcmd.setName('show') // opt: type [user]
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
					{ name: 'Tome Accessory Upgrade', value: 'accUp' },
					{ name: 'Priority', value: 'prio' },
					{ name: 'User', value: 'user' }
				)
			)
			.addUserOption(opt => opt.setName('user')
				.setDescription('user you want to see')
			)
		)
		.addSubcommand(subcmd => subcmd.setName('create') // opt: user
			.setDescription('Create a new item user profile')
			.addUserOption(opt.setName('user')
				.setDescription('Who you want to create a profile for')
				.setRequired(true)
			)
		),
	/**
	 * @param {import('discord.js').Interaction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const cmd = interaction.options.getSubcommand();
		const user = interaction.options.getMember('user');
		const type = interaction.options.getString('type');
		const itemMgr = new ItemManager(type);

		let reply;
		switch (cmd) {
			case 'give':
				reply = giveBtn(user, type);
				break;
			case 'show':
				if (type === 'user' && user !== null)
					reply = { embeds: [new Member(user.id).toEmbed(user)] };
				else if (type === 'user' && user === null)
					reply = { content: 'Please pass a user as the second argument' }
				else
					reply = itemMgr.generateData();
				break;
			case 'create':
				new Member(user.id).saveMember();
				reply = { content: user + ' Has been created' };
				break;
		}

		interaction.editReply(reply);
	},
};

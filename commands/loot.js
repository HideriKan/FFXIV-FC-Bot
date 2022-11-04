const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, PermissionFlagsBits, bold, } = require('discord.js');
const ItemManager = require('../Classes/ItemManager');
const Member = require('../Classes/Member');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loot')
		.setDescription('Loot tracker')
		.setDMPermission(false) // TODO: move this and the permission to each individual subcommand
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addSubcommand(subcmd => subcmd.setName('give') // opt: user, type, [isdone]
			.setDescription('Distrubte loot for a raid member')
			.addUserOption(opt => opt.setName('user')
				.setDescription('who got the loot')
				.setRequired(true)
			)
			.addStringOption(opt => opt.setName('type')
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
			.addBooleanOption(opt => opt.setName('isdone')
				.setDescription('Indicates a finished state for the type. Only works on Gear, GearUp or AccUp')
			)
		)
		.addSubcommand(subcmd => subcmd.setName('show') // opt: type, [user]
			.setDescription('Show who can roll / priority')
			.addStringOption(opt => opt.setName('type')
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
					{ name: 'Profile', value: 'user' },
					{ name: 'Statistics', value: 'stats' }
				)
			)
			.addUserOption(opt => opt.setName('user')
				.setDescription('user you want to see')
			)
		)
		.addSubcommand(subcmd => subcmd.setName('remove') // opt: user
			.setDescription('Remove the a user from the database')
			.addUserOption(opt => opt.setName('user')
				.setDescription('Who you want to remove')
				.setRequired(true)
			)
		)
	,
	/**
	 * @param {import('discord.js').Interaction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const cmd = interaction.options.getSubcommand();
		const user = interaction.options.getMember('user');
		const type = interaction.options.getString('type');
		const setDone = interaction.options.getBoolean('isdone');
		const itemMgr = new ItemManager(type);

		let reply;
		switch (cmd) {
			case 'give':
				reply = addGiveBtn(user, type, setDone);
				break;
			case 'show':
				if (type === 'user' && user === null)
					reply = { content: 'Please pass a user as the second argument' }
				else if (type !== 'stats' && user !== null)
					reply = { embeds: [new Member(user.id).toEmbed(user, type)] }
				else if (type === 'stats')
					reply = ItemManager.toEmbedStats();
				else
					reply = itemMgr.toRollOverview(); // TODO: change to embed
				break;
			case 'remove':
				reply = addRemoveBtn(user);
				break;
		}

		await interaction.editReply(reply);
	},
};


/**
 * gives the user a question with a choice to add the item type to the user
 * @param {GuildMember} user mentioned user
 * @param {String} type item type
 * @param {Boolean} setDone if the type should be ignored for future
 * @returns an reply object to be sent to the user
 */
function addGiveBtn(user, type, setDone) {
	const reply = { content: null, components: null, ephemeral: true };
	reply.components = [new ActionRowBuilder()
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
		)
	];

	if (setDone)
		reply.content = `Set ${bold(ItemManager.nameFromItemValue(type).name)} for ${user} as done`;
	else
		reply.content = `Give ${bold(ItemManager.nameFromItemValue(type).name)} to ${user}`;

	const member = new Member(user.id);
	let baseline = 0;

	// Warning for certain types
	switch (type) {
		case 'gear':
			if (member.gearDone)
				reply.content += bold(`\nWarning! ${user.displayName} is already done with thier raid gear, proceed?`)
			break;
		case 'weap':
			if (member.hasWeapon)
				reply.content += bold(`\nWarning! ${user.displayName} already has a raid weapon, proceed?`)
			break;
		case 'body':
			if (member.hasBody)
				reply.content += bold(`\nWarning! ${user.displayName} already has a raid body, proceed?`)
			break;
		case 'tomeWeap':
			if (member.hasTomeWeap)
				reply.content += bold(`\nWarning! ${user.displayName} already has a tome weapon, proceed?`)
			if (member.hasWeapon)
				reply.content += bold(`\nWarning! ${user.displayName} alreay has a tome weapon upgrade, proceed?`)
			break;
		case 'tomeUp':
			if (!member.hasTomeWeap)
				reply.content += bold(`\nWarning! ${user.displayName} does not own the tome weapon, proceed?`)
			if (member.hasTomeWeapUp)
				reply.content += bold(`\nWarning! ${user.displayName} alreay has the tome weapon upgrade, proceed?`)
			if (member.hasWeapon)
				reply.content += bold(`\nWarning! ${user.displayName} alreay has a raid weapon, proceed?`)
			break;
		case 'gearUp':
			baseline = Member.getCurrentBaseline(type);
			if (member.totalGearUp > baseline && !setDone)
				reply.content += bold(`\nWarning! Max allowed: ${baseline + 1}, ${user.displayName} has ${member.totalGearUp}, proceed?`)
			if (member.gearUpDone)
				reply.content += bold(`\nWarning! ${user.displayName} is already done with gear upgrades, proceed?`)

			break;
		case 'accUp':
			baseline = Member.getCurrentBaseline(type);
			if (member.totalAccUp > baseline && !setDone)
				reply.content += bold(`\nWarning! Max allowed: ${baseline + 1}, ${user.displayName} has ${member.totalGearUp}, proceed?`)
			if (member.accUpDone)
				reply.content += bold(`\nWarning! ${user.displayName} is already done with accessory upgrades, proceed?`)
			break;
	}

	return reply;
}

/**
 * gives the user a question with a choice to remove the user from the file
 * @param {GuildMember} user mentioned user
 */
function addRemoveBtn(user) {
	const reply = { content: null, components: null, ephemeral: true };
	reply.content = `Remove ${user} from the database`
	reply.components = [new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('yesrem')
				.setLabel('Yes')
				.setStyle(ButtonStyle.Danger)
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('no')
				.setLabel('No')
				.setStyle(ButtonStyle.Secondary)
		)
	];

	return reply;
}
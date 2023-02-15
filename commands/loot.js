const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, bold, } = require('discord.js');
const ItemManager = require('../Classes/ItemManager');
const Member = require('../Classes/Member');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loot')
		.setDescription('Loot tracker')
		.setDMPermission(false)
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
					{ name: 'Tome Gear Upgrade', value: 'gearUp' },
					{ name: 'Tome Accessory Upgrade', value: 'accUp' },
					{ name: 'Tome Weapon', value: 'tomeWeap' },
					{ name: 'Tome Weapon Upgrade', value: 'tomeUp' },
					{ name: 'Weapon', value: 'weap' },
					{ name: 'Body', value: 'body' },
					{ name: 'Priority', value: 'prio' }
				)
			)
			.addBooleanOption(opt => opt.setName('isdone')
				.setDescription('(Optional) Indicates a finished state. Only works on Gear, GearUp or AccUp')
			)
		)
		.addSubcommand(subcmd => subcmd.setName('show') // opt: type, [user]
			.setDescription('Show who can roll / priority')
			.addStringOption(opt => opt.setName('type')
				.setDescription('Item Type')
				.setRequired(true)
				.addChoices(
					{ name: 'Priority', value: 'prio' },
					{ name: 'Gear', value: 'gear' },
					{ name: 'Tome Gear Upgrade', value: 'gearUp' },
					{ name: 'Tome Accessory Upgrade', value: 'accUp' },
					{ name: 'Tome Weapon', value: 'tomeWeap' },
					{ name: 'Tome Weapon Upgrade', value: 'tomeUp' },
					{ name: 'Weapon', value: 'weap' },
					{ name: 'Body', value: 'body' },
					{ name: 'Profile', value: 'user' },
					{ name: 'Statistics', value: 'stats' }
				)
			)
			.addUserOption(opt => opt.setName('user')
				.setDescription('(Optional) Only show for this user')
			)
		)
		.addSubcommand(subcmd => subcmd.setName('data') // opt: [operation, user]
			.setDescription('Manipulates the database')
			.addStringOption(opt => opt.setName('operation')
				.setDescription('Choose the operation you wish to perform')
				.addChoices(
					{ name: 'Delete', value: 'delete' },
					{ name: 'Reset', value: 'reset' }
				)
			)
			.addUserOption(opt => opt.setName('user')
				.setDescription('Choose to only affect one member')
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
		const operation = interaction.options.getString('operation');
		const setDone = interaction.options.getBoolean('isdone');
		const itemMgr = new ItemManager(type);

		let reply;
		switch (cmd) {
		case 'give':
			reply = addGiveBtn(user, type, setDone);
			break;
		case 'show':
			if (type === 'user' && user === null)
				reply = { content: 'Please pass a user as the second argument' };
			else if (type !== 'stats' && user !== null)
				reply = Member.toEmbed(user, type);
			else if (type === 'stats')
				reply = ItemManager.toEmbedStats();
			else
				reply = itemMgr.toRollOverview();
			break;
		case 'data':
			if (operation === 'delete')
				reply = addRemoveBtn(user);
			if (operation === 'reset')
				reply = addResetBtn(user);
			break;
		}

		await interaction.editReply(reply);
	},
};

/**
 * gives the user a question with a choice to add the item type to the user
 * @param {import("discord.js").GuildMember} user mentioned user
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
			reply.content += '\n' + bold(`Warning! ${user.displayName} is already done with thier raid gear, proceed?`);
		break;
	case 'weap':
		if (member.hasWeapon)
			reply.content += '\n' + bold(`Warning! ${user.displayName} already has a raid weapon, proceed?`);
		if (!Member.isWeapBodyBalanced() && member.hasBody)
			reply.content += '\n' + bold(`Warning! ${user.displayName} has a raid weapon & raid has weap/body imbalance, proceed?`);
		break;
	case 'body':
		if (member.hasBody)
			reply.content += '\n' + bold(`Warning! ${user.displayName} already has a raid body, proceed?`);
		if (!Member.isWeapBodyBalanced() && member.hasWeapon)
			reply.content += '\n' + bold(`Warning! ${user.displayName} has a raid weapon & raid has weap/body imbalance, proceed?`);
		break;
	case 'tomeWeap':
		if (member.hasTomeWeap)
			reply.content += '\n' + bold(`Warning! ${user.displayName} already has a tome weapon, proceed?`);
		if (member.hasWeapon)
			reply.content += '\n' + bold(`Warning! ${user.displayName} already has a raid weapon, proceed?`);
		break;
	case 'tomeUp':
		if (!member.hasTomeWeap)
			reply.content += '\n' + bold(`Warning! ${user.displayName} does not own the tome weapon, proceed?`);
		if (member.hasTomeWeapUp)
			reply.content += '\n' + bold(`Warning! ${user.displayName} already has the tome weapon upgrade, proceed?`);
		if (member.hasWeapon)
			reply.content += '\n' + bold(`Warning! ${user.displayName} already has a raid weapon, proceed?`);
		break;
	case 'gearUp':
		baseline = Member.getCurrentBaseline(type);
		if (member.totalGearUp > baseline && !setDone)
			reply.content += '\n' + bold(`Warning! Max. allowed: ${baseline + 1}, ${user.displayName} has ${member.totalGearUp}, proceed?`);
		if (member.gearUpDone)
			reply.content += '\n' + bold(`Warning! ${user.displayName} is already done with gear upgrades, proceed?`);

		break;
	case 'accUp':
		baseline = Member.getCurrentBaseline(type);
		if (member.totalAccUp > baseline && !setDone)
			reply.content += bold(`\nWarning! Max. allowed: ${baseline + 1}, ${user.displayName} has ${member.totalGearUp}, proceed?`);
		if (member.accUpDone)
			reply.content += bold(`\nWarning! ${user.displayName} is already done with accessory upgrades, proceed?`);
		break;
	}

	return reply;
}

/**
 * gives the user a question with a choice to remove the user from the file
 * @param {import("discord.js").GuildMember} user mentioned user
 */
function addRemoveBtn(user) {
	const reply = { content: null, components: null, ephemeral: true };
	reply.content = user === null ? 'Remove all members?' : `Remove ${user} from the database?`;
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

function addResetBtn(user) {
	const reply = { content: null, components: null, ephemeral: true };
	reply.content = user === null ? 'Reset all members?' : `Reset ${user} from the database?`;
	reply.components = [new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('yesreset')
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
const { bold, escapeUnderline, userMention, inlineCode, italic } = require('discord.js');
const Member = require('./Member');

class ItemManager {
	constructor(type) {
		this.type = ItemManager.fromItemName(type);
		if (this.type === undefined)
			this.type = ItemManager.fromItemValue(type);
	}

	static items = [
		{ name: 'Gear', value: 'gear', isBool: false },
		{ name: 'Weapon', value: 'weap', isBool: true },
		{ name: 'Body', value: 'body', isBool: true },
		{ name: 'Tome Weapon', value: 'tomeWeap', isBool: true },
		{ name: 'Tome Weapon Upgrade', value: 'tomeUp', isBool: true },
		{ name: 'Tome Gear Upgrade', value: 'gearUp', isBool: false },
		{ name: 'Tome Accessory Upgrade', value: 'accUp', isBool: false },
		{ name: 'Priority', value: 'prio', isBool: false }
	]

	static itemNameFromMessage(content) {
		const search = '**'
		const first = content.indexOf(search) + search.length; // plus search length to ignore it on the next search and in the substring
		const second = content.indexOf(search, first);
		const type = content.substring(first, second);

		return type;
	}

	static fromItemName(name) {
		return ItemManager.items.find(item => {
			if (item.name === name)
				return item.value;
		});
	}

	static fromItemValue(value) {
		return ItemManager.items.find(item => {
			if (item.value === value)
				return item.name;
		})
	}

	/**
	 * 
	 * @param {import('discord.js').ButtonInteraction} interaction 
	 */
	async assingToMember(interaction) {
		const user = interaction.message.mentions.parsedUsers.first();
		const member = new Member(user.id);

		switch (this.type.value) {
			case 'gear':
				member.totalGear++;
				break;
			case 'weap':
				member.hasWeapon = true;
				break;
			case 'body':
				member.hasBody = true;
				break;
			case 'tomeWeap':
				member.hasTomeWeap = true;
				break;
			case 'tomeUp':
				member.hasTomeWeapUp = true;
				break;
			case 'gearUp':
				member.totalGearUp++;
				break;
			case 'accUp':
				member.totalAccUp++;
				break;
			case 'prio':
				// TODO:
				break;
		}
		member.saveMember();

		interaction.update({ content: interaction.message.content.replace('Give', 'Gave'), components: [] });
	}

	getArrayFunc(reply, output) {
		let func;

		// Need  = false
		// Greed = true
		// Pass  = null
		switch (this.type.value) {
			case 'gear': // Isolated
				reply.content = bold('Total Gear:\n');
				func = member => { output.push({ name: member.id, value: member.totalGear }); };
				break;
			case 'weap': // Dependant on body
				reply.content = bold('Weapon Rolls:\n');
				if (Member.isWeapBodyBalanced())
					func = member => { output.push({ name: member.id, value: member.hasWeapon }); };
				else
					func = member => { output.push({ name: member.id, value: member.hasWeapon || member.hasBody }); };
				break;
			case 'body': // Dependant on weap
				reply.content = bold('Body Rolls:\n');
				if (Member.isWeapBodyBalanced())
					func = member => { output.push({ name: member.id, value: member.hasBody }); };
				else
					func = member => { output.push({ name: member.id, value: member.hasBody || member.hasWeapon }); };

				break;
			case 'tomeWeap': // Isolated
				reply.content = bold('Tome Weapon Rolls: ') + italic('requires 500 Tomes\n');
				func = member => { output.push({ name: member.id, value: member.hasTomeWeap ? null : false }); };
				break;
			case 'tomeUp': // Dependant on tomeWeap
				reply.content = bold(`Tome Weapon Upgrade Rolls: `) + italic('requires Tome Weapon\n');
				func = member => { output.push({ name: member.id, value: member.hasTomeWeapUp ? null : member.hasTomeWeap ? false : true }); };
				break;
			case 'gearUp': // Isolated
				reply.content = bold('Total Gear Upgrade:\n');
				func = member => { output.push({ name: member.id, value: member.totalGearUp }); };
				break;
			case 'accUp': // Isolated
				reply.content = bold('Total Accessory Upgrade:\n');
				func = member => { output.push({ name: member.id, value: member.totalAccUp }); };
				break;
			case 'prio':
				reply.content = bold('Current Priority:\n');
				func = member => { output.push({ name: member.id, value: member.priority }); };
				// TODO:
				break;
		}

		return func;
	}

	generateData() {
		const reply = { content: null, components: null, ephemeral: true };
		const members = Member.getAllMembers();
		const output = new Array();

		members.forEach(this.getArrayFunc(reply, output));
		output.sort((a, b) => a.value - b.value);
		output.forEach(this.type.isBool ? this.dataFromBool(reply) : this.dataFromNumber(reply));

		return reply;
	}

	rollFromBool = bool => bool ? 'Greed' : bool === null ? ' Pass' : ' Need';
	dataFromBool = reply => item => { reply.content += `${inlineCode(this.rollFromBool(item.value))}: ${userMention(item.name)}\n` };
	dataFromNumber = reply => item => { reply.content += `${inlineCode(item.value)}: ${userMention(item.name)}\n` };
}

module.exports = ItemManager;
const { bold, escapeUnderline } = require('discord.js');
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
	static async assingToMember(interaction) {
		const splitArr = interaction.message.content.split(' ');
		const type = splitArr[1];
		const user = interaction.message.mentions.parsedUsers.first();
		const memberName = user.nickname === undefined ? user.username : user.nickname
		const member = new Member(memberName, user.id);

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
				member.TotalGearUp++;
				break;
			case 'accUp':
				member.TotalAccUp++;
				break;
			case 'prio':
				// TODO:
				break;
		}
		member.saveMember();


		interaction.update({ content: 'Updated', components: [] });
	}

	static generateData(type) {
		const reply = { content: null, components: null, ephemeral: true };
		const members = Member.getAllMembers();
		const output = new Array();
		let func;

		switch (this.type.value) {
				break;
			case 'weap':
				reply.content = escapeUnderline(bold('Has Weapon:\n'));
				func = member => { output.push({ name: member.name, value: member.hasWeapon }); };
				break;
			case 'body':
				reply.content = escapeUnderline(bold('Has Body:\n'));
				func = member => { output.push({ name: member.name, value: member.hasBody }); };
				break;
			case 'tomeWeap':
				reply.content = escapeUnderline(bold('Has Tome Weapon:\n'));
				func = member => { output.push({ name: member.name, value: member.hasTomeWeap }); };
				break;
			case 'tomeUp':
				reply.content = escapeUnderline(bold('Has Tome Weapon Upgrade:\n'));
				func = member => { output.push({ name: member.name, value: member.hasTomeWeapUp }); };
				break;
			case 'gearUp':
				reply.content = escapeUnderline(bold('Total Gear Upgrade:\n'));
				func = member => { output.push({ name: member.name, value: member.TotalGearUp }); };
				break;
			case 'accUp':
				reply.content = escapeUnderline(bold('Total Accessory Upgrade:\n'));
				func = member => { output.push({ name: member.name, value: member.TotalAccUp }); };
				break;
			case 'prio':
				reply.content = escapeUnderline(bold('Current Priority:\n'));
				func = member => { output.push({ name: member.name, value: member.priority }); };
				// TODO:
				break;
		}

		members.forEach(func);
		output.sort((a, b) => a.value > b.value );
		output.forEach(item => { reply.content += `${item.value}: ${item.name}\n` });

		return reply;

	}
}

module.exports = ItemManager;
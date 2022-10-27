const { bold, escapeUnderline } = require('discord.js');
const Member = require('./Member');

class ItemManager {
	constructor() {

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

		switch (type) {
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

		// TODO: use user instead of name
		switch (type) {
			case 'gear':
				reply.content = escapeUnderline(bold('Total Gear:\n'));
				func = member => { output.push({ name: member.name, value: member.totalGear }); };
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
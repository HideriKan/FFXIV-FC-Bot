const { bold, inlineCode, italic } = require('discord.js');
const Member = require('./Member');

class ItemManager {
	constructor(type) {
		this.type = ItemManager.valueFromItemName(type);
		if (this.type === undefined)
			this.type = ItemManager.nameFromItemValue(type);
	}

	static items = [ // TODO: add done?
		{ name: 'Gear', value: 'gear', isBool: false },
		{ name: 'Weapon', value: 'weap', isBool: true },
		{ name: 'Body', value: 'body', isBool: true },
		{ name: 'Tome Weapon', value: 'tomeWeap', isBool: true },
		{ name: 'Tome Weapon Upgrade', value: 'tomeUp', isBool: true },
		{ name: 'Tome Gear Upgrade', value: 'gearUp', isBool: false },
		{ name: 'Tome Accessory Upgrade', value: 'accUp', isBool: false },
		{ name: 'Priority', value: 'prio', isBool: false }
	]

	static itemTypeFromMessage(content) {
		const search = '**'
		const first = content.indexOf(search) + search.length; // plus search length to ignore it on the next search and in the substring
		const second = content.indexOf(search, first);
		const type = content.substring(first, second);

		return type;
	}

	static valueFromItemName(name) {
		return ItemManager.items.find(item => {
			if (item.name === name)
				return item.value;
		});
	}

	static nameFromItemValue(value) {
		return ItemManager.items.find(item => {
			if (item.value === value)
				return item.name;
		})
	}

	static sortPriorityOfAll() { // Do I really need this?
		const members = Member.getAllMembers();
		members.sort((a, b) => a.priority - b.priority);

		for (let i = 0; i < members.length; i++)
			members[i].priority = i + 1;

		Member.saveMembers(members);
	}

	static toEmbedStats() {
		let totalGear = 0, totalGearUp = 0, totalAccUp = 0,
			highGear = { num: 0, name: [] }, highGearUp = { num: 0, name: [] }, highAccUp = { num: 0, name: [] },
			lowestGear = { num: 0, name: [] }, lowestGearUp = { num: 0, name: [] }, lowestAccUp = { num: 0, name: [] };


		const members = Member.getAllMembers();
		members.forEach(m => {
			totalGear += m.totalGear;
			totalGearUp += m.totalGearUp;
			totalAccUp += m.totalAccUp;

			if (highGear <= m.totalGear) {
				highGear.num = m.totalGear;
				highGear.name.push(m.displayName);
			}
			if (highGearUp <= m.totalGearUp) {
				highGearUp.num = m.totalGearUp;
				highGearUp.name.push(m.displayName);
			}
			if (highAccUp <= m.totalAccUp) {
				highAccUp.name.push(m.displayName);
				highAccUp.num = m.totalAccUp;
			}

			if (lowestGear >= m.totalGear) {
				lowestGear.name.push(m.displayName);
				lowestGear.num = m.totalGear;
			}
			if (lowestGearUp >= m.totalGearUp) {
				lowestGearUp.name.push(m.displayName);
				lowestGearUp.num = m.totalGearUp;
			}
			if (lowestAccUp >= m.totalAccUp) {
				lowestAccUp.name.push(m.displayName);
				lowestAccUp.num = m.totalAccUp;
			}
		});


		let fields = [{
			name: 'Gear', value: `/\\: ${highGear.num} (${highGear.num / totalGear * 100}%) ${Member.getNamesFromList(members, highGear.name)}
		\\/: ${lowestGear.num} (${lowestGear.num / totalGear * 100}%) ${Member.getNamesFromList(members, lowestGear.name)}`
		}, {
			name: 'Gear Upgrades', value: `/\\: ${highGearUp.num} (${highGearUp.num / totalGear * 100}%) ${Member.getNamesFromList(members, highGearUp.name)}
		\\/: ${lowestGearUp.num} (${lowestGearUp.num / totalGear * 100}%) ${Member.getNamesFromList(members, lowestGearUp.name)}`
		}, {
			name: 'Acc Upgrades', value: `/\\: ${highAccUp.num} (${highAccUp.num / totalGear * 100}%) ${Member.getNamesFromList(members, highAccUp.name)}
		\\/: ${lowestAccUp.num} (${lowestAccUp.num / totalGear * 100}%) ${Member.getNamesFromList(members, lowestAccUp.name)}`
		}];

		const embed = new EmbedBuilder()
			.setTitle('Statistics')
			.addFields(fields)
			.setFooter({ text: 'work in progress' });

		return embed;
	}

	static getNamesFromList = (members, foundList) => members.filter(m => foundList.includes(m.id)).toString();

	/**
	 * 
	 * @param {import('discord.js').ButtonInteraction} interaction 
	 */
	async assingItemToMember(interaction) {
		const user = interaction.message.mentions.members.first();
		const setDone = interaction.message.content.includes('as done?');
		const member = new Member(user.id, user.displayName);

		switch (this.type.value) {
			case 'gear':
				if (setDone)
					member.gearDone = true;
				else {
					member.totalGear++;
					member.priority = 9
					ItemManager.sortPriorityOfAll();
				}
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
				if (setDone)
					member.gearUpDone = true;
				else
					member.totalGearUp++;
				break;
			case 'accUp':
				if (setDone)
					member.accUpDone = true;
				else
					member.totalAccUp++;
				break;
			case 'prio':
				if (member.priority === 10) // put at the bottom of the priority
					member.priority = Member.getAllMembers().length + 1;

				break;
		}

		member.saveMember();

		interaction.update({ content: interaction.message.content.replace('Give', 'Gave'), components: [] });
	}

	getMemberValueFunc(reply, output) {
		let func;

		// Need  = false
		// Greed = true
		// Pass  = null
		switch (this.type.value) {
			case 'gear': // Isolated
				reply.content = bold('Total Gear:\n');
				func = member => { if (!member.gearDone) output.push({ name: member.displayName, value: member.totalGear }); };
				break;
			case 'weap': // Dependant on body
				reply.content = bold('Weapon Rolls:\n');
				if (Member.isWeapBodyBalanced())
					func = member => { output.push({ name: member.displayName, value: member.hasWeapon }); };
				else
					func = member => { output.push({ name: member.displayName, value: member.hasWeapon || member.hasBody }); };
				break;
			case 'body': // Dependant on weap
				reply.content = bold('Body Rolls:\n');
				if (Member.isWeapBodyBalanced())
					func = member => { output.push({ name: member.displayName, value: member.hasBody }); };
				else
					func = member => { output.push({ name: member.displayName, value: member.hasBody || member.hasWeapon }); };
				break;
			case 'tomeWeap': // Isolated
				reply.content = bold('Tome Weapon Rolls:\n') + italic('requires 500 Tomes\n');
				func = member => { output.push({ name: member.displayName, value: member.hasTomeWeap ? null : false }); };
				break;
			case 'tomeUp': // Dependant on tomeWeap
				reply.content = bold(`Tome Weapon Upgrade Rolls:\n`) + italic('requires Tome Weapon\n');
				func = member => { output.push({ name: member.displayName, value: member.hasTomeWeapUp ? null : member.hasTomeWeap ? false : true }); };
				break;
			case 'gearUp': // Isolated
				reply.content = bold('Total Gear Upgrade:\n') + italic(`Current baseline: ${bold(Member.getCurrentBaseline(this.type.value))}\n`);
				func = member => { if (!member.gearUpDone) output.push({ name: member.displayName, value: member.totalGearUp }); };
				break;
			case 'accUp': // Isolated
				reply.content = bold('Total Accessory Upgrade:\n') + italic(`Current baseline: ${bold(Member.getCurrentBaseline(this.type.value))}\n`);
				func = member => { if (!member.accUpDone) output.push({ name: member.displayName, value: member.totalAccUp }); };
				break;
			case 'prio':
				reply.content = bold('Current Priority:\n');
				func = member => { output.push({ name: member.displayName, value: member.priority }); };
				break;
		}

		return func;
	}

	toRollOverview() {
		const reply = { content: null, components: null, ephemeral: true };
		const members = Member.getAllMembers();
		const output = new Array();

		members.forEach(this.getMemberValueFunc(reply, output));
		output.sort((a, b) => {
			if (a.value === null)
				return 1
			if (b.value === null)
				return -1

			return a.value - b.value
		});
		output.forEach(this.type.isBool ? this.dataFromBool(reply) : this.dataFromNumber(reply));

		return reply;
	}

	rollFromBool = bool => bool ? 'Greed' : bool === null ? ' Pass' : ' Need';
	dataFromBool = reply => item => { reply.content += `${inlineCode(this.rollFromBool(item.value))}: ${item.name}\n` };
	dataFromNumber = reply => item => { reply.content += `${inlineCode(item.value)}: ${item.name}\n` };
}

module.exports = ItemManager;
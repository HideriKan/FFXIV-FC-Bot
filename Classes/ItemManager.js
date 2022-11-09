const { inlineCode, EmbedBuilder } = require('discord.js');
const Member = require('./Member');

/**
 * A collection of method to display and manage item / item types
 */
class ItemManager {
	/**
	 * Manages the passed item with the members
	 * @param {String} type item type, can either be the item value or the item display name
	 */
	constructor(type) {
		this.type = ItemManager.valueFromItemName(type);
		if (this.type === undefined)
			this.type = ItemManager.nameFromItemValue(type);
	}

	// List of all the items to be parsed
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

	/**
	 * extracts the item type from the give message send from the bot before confirming the command
	 * @param {String} content message content
	 * @returns type obejct with name value and isBool boolean
	 */
	static itemTypeFromMessage(content) {
		const search = '**'
		const first = content.indexOf(search) + search.length; // plus search length to ignore it on the next search and in the substring
		const second = content.indexOf(search, first);
		const type = content.substring(first, second);

		return type;
	}

	/**
	 * searches the list of items for the given item type value and returns the value
	 * @param {String} name display name of the item
	 * @returns value of the item type
	 */
	static valueFromItemName(name) {
		return ItemManager.items.find(item => {
			if (item.name === name)
				return item.value;
		});
	}

	/**
	 * searches the list off items for the given item type value and returns the display name
	 * @param {String} value value of the item type
	 * @returns display name of the item type
	 */
	static nameFromItemValue(value) {
		return ItemManager.items.find(item => {
			if (item.value === value)
				return item.name;
		})
	}

	/**
	 * WIP
	 * collects data from the members and tries to calculate the max and min values with procentages certain gear
	 * @returns discord embed
	 */
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

		// TODO: fix when used on emtpy member file
		// TODO: add count of weap, body, ...
		let fields = [{
			name: 'Gear', value: `/\\: ${highGear.num} (${highGear.num / totalGear * 100}%) ${ItemManager.getNamesFromList(members, highGear.name)}
		\\/: ${lowestGear.num} (${lowestGear.num / totalGear * 100}%) ${ItemManager.getNamesFromList(members, lowestGear.name)}`
		}, {
			name: 'Gear Upgrades', value: `/\\: ${highGearUp.num} (${highGearUp.num / totalGear * 100}%) ${ItemManager.getNamesFromList(members, highGearUp.name)}
		\\/: ${lowestGearUp.num} (${lowestGearUp.num / totalGear * 100}%) ${ItemManager.getNamesFromList(members, lowestGearUp.name)}`
		}, {
			name: 'Acc Upgrades', value: `/\\: ${highAccUp.num} (${highAccUp.num / totalGear * 100}%) ${ItemManager.getNamesFromList(members, highAccUp.name)}
		\\/: ${lowestAccUp.num} (${lowestAccUp.num / totalGear * 100}%) ${ItemManager.getNamesFromList(members, lowestAccUp.name)}`
		}];

		const embed = new EmbedBuilder()
			.setTitle('Statistics')
			.addFields(fields)
			.setFooter({ text: 'work in progress' });

		return { embeds: [embed] };
	}

	/**
	 * assings the item type to the mentioned member in the message
	 * @param {import('discord.js').ButtonInteraction} interaction from the interactionCreate event
	 */
	async assingItemToMember(interaction) {
		const user = interaction.message.mentions.members.first();
		const setDone = interaction.message.content.includes('as done');
		const member = new Member(user.id, user.displayName);

		switch (this.type.value) {
			case 'gear':
				if (setDone)
					member.gearDone = true;
				else {
					member.totalGear++;
					member.priority = 9;
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

	/**
	 * creates a custom foreach function to customize the output 
	 * @param {EmbedBuilder} embed message embed
	 * @param {Array} output container to keep all the custom objects
	 * @returns for each function
	 */
	getMemberValueFunc(embed, output) {
		let func;

		// Need  = false
		// Greed = true
		// Pass  = null
		switch (this.type.value) {
			case 'gear': // Isolated
				embed.setTitle('Total Gear'); // TODO: GEARBASED: add baseline warning
				func = member => { if (!member.gearDone) output.push({ name: member.displayName, value: member.totalGear }); };
				break;
			case 'weap': // Dependant on body
				embed.setTitle('Weapon Rolls');
				if (Member.isWeapBodyBalanced())
					func = member => { output.push({ name: member.displayName, value: member.hasWeapon }); };
				else
					func = member => { output.push({ name: member.displayName, value: member.hasWeapon || member.hasBody }); };
				break;
			case 'body': // Dependant on weap
				embed.setTitle('Body Rolls');
				if (Member.isWeapBodyBalanced())
					func = member => { output.push({ name: member.displayName, value: member.hasBody }); };
				else
					func = member => { output.push({ name: member.displayName, value: member.hasBody || member.hasWeapon }); };
				break;
			case 'tomeWeap': // Isolated
				embed.setTitle('Tome Weapon Rolls');
				embed.setFooter({ text: 'requires 500 Tomes' });
				func = member => { output.push({ name: member.displayName, value: member.hasTomeWeap ? null : false }); };
				break;
			case 'tomeUp': // Dependant on tomeWeap
				embed.setTitle(`Tome Weapon Upgrade Rolls`);
				embed.setFooter({ text: 'requires Tome Weapon' });
				func = member => { output.push({ name: member.displayName, value: member.hasTomeWeapUp ? null : member.hasTomeWeap ? false : true }); };
				break;
			case 'gearUp': // Isolated
				embed.setTitle('Total Gear Upgrade');
				embed.setFooter({ text: `Current baseline: ${Member.getCurrentBaseline(this.type.value)}` });
				func = member => { if (!member.gearUpDone) output.push({ name: member.displayName, value: member.totalGearUp }); };
				break;
			case 'accUp': // Isolated
				embed.setTitle('Total Accessory Upgrade');
				embed.setFooter({ text: `Current baseline: ${Member.getCurrentBaseline(this.type.value)}` });
				func = member => { if (!member.accUpDone) output.push({ name: member.displayName, value: member.totalAccUp }); };
				break;
			case 'prio':
				embed.setTitle('Current Priority');
				func = member => { output.push({ name: member.displayName, value: member.priority }); };
				break;
		}

		return func;
	}

	/**
	 * creates a reply with all the members found in the file and depending on thier contents decides thier roll
	 * @returns {Object} message reply object
	 */
	toRollOverview() {
		const embed = new EmbedBuilder();
		const members = Member.getAllMembers();
		if (members.length === 0)
			return { content: 'Please add members first', ephemeral: true };

		const output = new Array();

		members.forEach(this.getMemberValueFunc(embed, output));
		output.sort((a, b) => {
			if (a.value === null)
				return 1
			if (b.value === null)
				return -1

			return a.value - b.value
		});
		embed.setDescription(this.type.isBool ? this.dataFromBool(output) : this.dataFromNumber(output))

		return { embeds: [embed] };
	}

	// Simple functions to keep the code not as messy
	/**
	 * filters the members list to only include members from the found list
	 * @param {Array} members given from Member.getAllMembers()
	 * @param {Array} foundList list to filter from
	 * @returns {String} string of all members found in the foundList
	 */
	static getNamesFromList = (members, foundList) => members.filter(m => foundList.includes(m.id)).toString();

	/**
	 * parses the boolean to the assinged roll type as a string
	 * @param {Boolean} bool nullable boolean to cover all of the roll types
	 * @returns {String} roll based on the boolean
	 */
	rollFromBool = bool => bool ? 'Greed' : bool === null ? ' Pass' : ' Need';

	/**
	 * generates strings to display the roll table but uses the rollFromBool method to display roll types instead of numbers
	 * @param {Array} output array with each member's data
	 * @returns foreach function to display certain data
	 */
	dataFromBool = output => {
		let data = '';
		output.forEach(item => {
			data += `${inlineCode(this.rollFromBool(item.value))}: ${item.name}\n`
		});
		return data;
	}

	/**
	 * generates strings to display the roll table
	 * @param {Array} output array with each member's data
	 * @returns foreach function to display certain data
	 */
	dataFromNumber = output => {
		let data = '';
		output.forEach(item => {
			data += `${inlineCode(item.value)}: ${item.name}\n`
		});
		return data;
	}
}

module.exports = ItemManager;
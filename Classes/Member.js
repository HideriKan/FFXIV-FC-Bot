const { EmbedBuilder, GuildMember } = require('discord.js');
const fs = require('fs');
const { ensureFileExists, onFileError } = require('../utility');

class Member {
	static fileName = './MemberLoot.json';
	static csvName = './MemberLoot.csv';

	constructor(id, displayName = '') {
		this.displayName = displayName ? displayName : '';
		this.id = id; // unique discord snowflake id
		this.priority = 10;
		this.totalGear = 0;
		this.gearDone = false;
		this.hasWeapon = false;
		this.hasBody = false;
		this.hasTomeWeap = false;
		this.hasTomeWeapUp = false;
		this.totalGearUp = 0;
		this.gearUpDone = false;
		this.totalAccUp = 0;
		this.accUpDone = false;

		this.fillFromFile()
	}

	/**
	 * saves the member to the json file
	 */
	saveMember() {
		const members = Member.getAllMembers();
		const index = members.findIndex(element => element.id === this.id)

		if (index >= 0)
			members[index] = this;
		else
			members.push(this)

		Member.saveMembers(members);
	}

	/**
	 * copys the values from the passed member
	 * @param {Member} member values to copy from
	 */
	fromMember(member) {
		this.displayName = this.displayName ? this.displayName : member.displayName; // only add the display name if there is none given
		this.id = member.id; // unique discord snowflake id
		this.priority = member.priority;
		this.totalGear = member.totalGear;
		this.gearDone = member.gearDone; // might not use
		this.hasWeapon = member.hasWeapon;
		this.hasBody = member.hasBody;
		this.hasTomeWeap = member.hasTomeWeap;
		this.hasTomeWeapUp = member.hasTomeWeapUp;
		this.totalGearUp = member.totalGearUp;
		this.gearUpDone = member.accUpDone;
		this.totalAccUp = member.totalAccUp;
		this.accUpDone = member.accUpDone;
	}

	/**
	 * tries to find the user in the file and fill the member with fond one
	 */
	fillFromFile() {
		ensureFileExists(Member.fileName);

		try {
			const data = JSON.parse(fs.readFileSync(Member.fileName, 'utf8'));
			const member = data.find(member => member.id === this.id);

			if (member !== undefined)
				this.fromMember(member);

		} catch (err) {
			console.error(onFileError(err).text);
		}
	}

	/**
	 * Generates an discord embed
	 * @param {GuildMember} user the user profile to display
	 * @param {String} type item value
	 * @returns generated embed
	 */
	toEmbed(user, type) {
		const embed = new EmbedBuilder()
			.setTitle(user.displayName)
			.setThumbnail(user.displayAvatarURL())
			.setColor(user.displayColor)
			.setFooter({ text: 'work in progress' });

		switch (type) {
			case 'gear':
				embed.setDescription(`Number of savage gear: ${this.totalGear}
				Is done with savage gear: ${this.gearDone ? 'Yes' : 'No'}`);
				break;
			case 'weap':
				embed.setDescription(`Has weapon: ${this.hasWeapon ? 'Yes' : 'No'}`);
				break;
			case 'body':
				embed.setDescription(`Has body: ${this.gearDone ? 'Yes' : 'No'}`);
				break;
			case 'tomeWeap':
				embed.setDescription(`Has tome weapon: ${this.hasTomeWeap ? 'Yes' : 'No'}`);
				break;
			case 'tomeUp':
				embed.setDescription(`Has tome weapon upgrade: ${this.hasTomeWeapUp ? 'Yes' : 'No'}`);
				break;
			case 'gearUp':
				embed.setDescription(`Number of gear upgrades: ${this.totalGearUp}
				Is done with gear upgrades: ${this.gearUpDone ? 'Yes' : 'No'}`);
				break;
			case 'accUp':
				embed.setDescription(`Number of accessories upgreades: ${this.totalAccUp}
				Is done with accessories upgreades: ${this.accUpDone ? 'Yes' : 'No'}`);
				break;
			case 'prio':
				embed.setDescription(`Current priority: ${this.priority}`);
				break;
			case 'user':
			default:
				embed.setDescription(`Current priority: ${this.priority}
				Number of savage gear: ${this.totalGear}
				Is done with savage gear: ${this.gearDone ? 'Yes' : 'No'}
				Has weapon: ${this.hasWeapon ? 'Yes' : 'No'}
				Has body: ${this.gearDone ? 'Yes' : 'No'}
				Has tome weapon: ${this.hasTomeWeap ? 'Yes' : 'No'}
				Has tome weapon upgrade: ${this.hasTomeWeapUp ? 'Yes' : 'No'}
				Number of gear upgrades: ${this.totalGearUp}
				Is done with gear upgrades: ${this.gearUpDone ? 'Yes' : 'No'}
				Number of accessories upgreades: ${this.totalAccUp}
				Is done with accessories upgreades: ${this.accUpDone ? 'Yes' : 'No'}`)
				break;
		}

		return embed;
	}

	/**
	 * Checks if the given id is already present is in the member json
	 * @param {String} id unqie discord snowflake id
	 * @returns true if found, otherwise false
	 */
	isInFile() {
		ensureFileExists(Member.fileName);

		try {
			const data = JSON.parse(fs.readFileSync(Member.fileName, 'utf8'));
			const member = data.find(member => member.id === this.id);

			return member !== undefined;
		} catch (error) {
			console.error(onFileError(error).text);
		}

		return false;
	}

	/**
	 * will write the passed data into the json
	 * @param {Array} data an Array of Member
	 */
	static saveMembers(data) {
		try {
			fs.writeFileSync(Member.fileName, JSON.stringify(data, null, 2));
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * 
	 * @param {import('discord.js').ButtonInteraction} interaction 
	 */
	static async removeMemberFromFile(interaction) {
		const user = interaction.message.mentions.parsedUsers.first();
		const members = Member.getAllMembers();
		const newMembers = members.filter(member => member.id !== user.id);

		Member.saveMembers(newMembers);

		interaction.update({ content: interaction.message.content.replace('Remove', 'Removed'), components: [] });
	}

	/**
	 * reads the json file and returns the found members
	 * @returns {Array} array of members
	 */
	static getAllMembers() {
		ensureFileExists(Member.fileName);

		try {
			return JSON.parse(fs.readFileSync(Member.fileName, 'utf8'));
		} catch (error) {
			console.error(onFileError(error).text);
		}
		return new Array;
	}

	/**
	 * Checks all members if everybody has atleast one weapon and body
	 * @returns {Boolean} true if everybody has alteast one, otherwise false
	 */
	static isWeapBodyBalanced() {
		const members = Member.getAllMembers();
		let isBalanced = true;

		members.forEach(member => {
			if (!member.hasBody && !member.hasWeapon) // if a member doesnt have a weap and a body
				isBalanced = false;
		});

		return isBalanced;
	}

	/**
	 * Checks all members for the given type and collects the lowest value as the baseline
	 * @param {String} type item value
	 * @returns returns the min. from all members item type
	 */
	static getCurrentBaseline(type) {
		const members = Member.getAllMembers();
		let baseline = 0;

		switch (type) { // TODO: prio
			case 'gearUp':
				members.forEach(member => { if (!member.gearUpDone) baseline = member.totalGearUp < baseline ? member.totalGearUp : baseline; });
				break;
			case 'accUp':
				members.forEach(member => { if (!member.accUpDone) baseline = member.totalAccUp < baseline ? member.totalAccUp : baseline; });
				break;
		}

		return baseline;
	}

	static toEmbedStats() {
		let totalGear = 0, totalGearUp = 0, totalAccUp = 0;
		let fields = [{ name: '', value: '' }];

		const members = Member.getAllMembers();
		members.forEach(m => {
			totalGear += m.totalGear;
			totalGearUp += m.totalGearUp;
			totalAccUp += m.totalAccUp;
		});

		let highGear = 0, highGearUp = 0, highAccUp = 0;

		const embed = new EmbedBuilder()
			.setTitle('Statistics')
			.addFields(fields)
			.setFooter({ text: 'work in progress' });

		return embed;
	}

	static toCSVFile() {
		let content = 'Id, Total gear, Weapon, Body, Tome weapon, Tome weapon upgrade, Gear upgrade, Gear upgrade done, Accessory upgrade, Accessory upgrade done\n';
		const members = Member.getAllMembers();
		members.forEach(member => {
			content += `${member.id}, ${member.totalGear}, ${member.hasTomeWeap ? '1' : '0'}, ${member.hasBody ? '1' : '0'}, ${member.hasTomeWeap ? '1' : '0'}, ${member.hasTomeWeapUp ? '1' : '0'}, ${member.totalGearUp}, ${member.gearUpDone ? '1' : '0'}, ${member.totalAccUp}, ${member.accUpDone ? '1' : '0'}\n`;
		});
	}
}

module.exports = Member;
const { EmbedBuilder, GuildMember } = require('discord.js');
const fs = require('fs');
const { fileExists, onFileError } = require('../utility');

class Member {
	static fileName = './MemberLoot.json';

	constructor(id) {
		this.id = id; // unique discord snowflake id
		this.hasBiS = false; // might not use
		this.priority = 0;
		this.totalGear = 0;
		this.hasWeapon = false;
		this.hasBody = false;
		this.hasTomeWeap = false;
		this.hasTomeWeapUp = false;
		this.totalGearUp = 0;
		this.totalAccUp = 0;

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
		this.id = member.id; // unique discord snowflake id
		this.hasBiS = member.hasBiS; // might not use
		this.priority = member.priority;
		this.totalGear = member.totalGear;
		this.hasWeapon = member.hasWeapon;
		this.hasBody = member.hasBody;
		this.hasTomeWeap = member.hasTomeWeap;
		this.hasTomeWeapUp = member.hasTomeWeapUp;
		this.totalGearUp = member.totalGearUp;
		this.totalAccUp = member.totalAccUp;
	}

	/**
	 * tries to find the user in the file and fill the member with fond one
	 */
	fillFromFile() {
		if (!fileExists(Member.fileName))
			return

		try {
			const data = JSON.parse(fs.readFileSync(Member.fileName, 'utf8'));
			const member = data.find(member => member.id === this.id);

			if (member !== undefined)
				this.fromMember(member);

		} catch (err) {
			onFileError(error)
		}
	}

	toEmbed(user, type) {
		const embed = new EmbedBuilder()
			.setTitle(user.displayName)
			.setThumbnail(user.displayAvatarURL())
			.setColor(user.displayColor)
			.setFooter({ text: 'work in progress' });

		switch (type) {
			case 'gear':
				embed.setDescription(`Number of savage gear: ${this.totalGear}`);
				break;
			case 'weap':
				embed.setDescription(`Has weapon: ${this.hasWeapon ? 'Yes' : 'No'}`);
				break;
			case 'body':
				embed.setDescription(`Has body: ${this.hasBiS ? 'Yes' : 'No'}`);
				break;
			case 'tomeWeap':
				embed.setDescription(`Has tome weapon: ${this.hasTomeWeap ? 'Yes' : 'No'}`);
				break;
			case 'tomeUp':
				embed.setDescription(`Has tome weapon upgrade: ${this.hasTomeWeapUp ? 'Yes' : 'No'}`);
				break;
			case 'gearUp':
				embed.setDescription(`Number of gear upgrades: ${this.totalGearUp}`);
				break;
			case 'accUp':
				embed.setDescription(`Number of accessories upgreades: ${this.totalAccUp}`);
				break;
			case 'prio':
				embed.setDescription(`Current priority: ${this.priority}`);
				break;
			case 'user':
			default:
				embed.setDescription(`Current priority: ${this.priority}
				Number of savage gear: ${this.totalGear}
				Has weapon: ${this.hasWeapon ? 'Yes' : 'No'}
				Has body: ${this.hasBiS ? 'Yes' : 'No'}
				Has tome weapon: ${this.hasTomeWeap ? 'Yes' : 'No'}
				Has tome weapon upgrade: ${this.hasTomeWeapUp ? 'Yes' : 'No'}
				Number of gear upgrades: ${this.totalGearUp}
				Number of accessories upgreades: ${this.totalAccUp}`)
				break;
		}

		return embed;
	}

	/**
	 * Checks if the given id is already present is in the member json
	 * @param {String} id unqie discord snowflake id
	 * @returns true if found, otherwise false
	 */
	static isInFile(id) {
		if (!fileExists(Member.fileName))
			return false;

		try {
			const data = JSON.parse(fs.readFileSync(Member.fileName, 'utf8'));
			const member = data.find(member => { member.id === id });

			return member !== undefined;
		} catch (error) {
			onFileError(error)
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
			if (err)
				return console.error(err);
		}
	}

	/**
	 * reads the json file and returns the found members
	 * @returns {Array} array of members
	 */
	static getAllMembers() {
		if (!fileExists(Member.fileName))
			return new Array;

		try {
			return JSON.parse(fs.readFileSync(Member.fileName, 'utf8'));
		} catch (error) {
			onFileError(error)
		}
		return new Array;
	}

	static isWeapBodyBalanced() {
		const members = Member.getAllMembers();
		let isBalanced = true;

		members.forEach(member => {
			if (!member.hasBody && !member.hasWeapon) // if a member doesnt have a weap and a body
				isBalanced = false;
		});

		return isBalanced;
	}

	static getCurrentBaseline(type) {
		const members = Member.getAllMembers();
		let baseline = 0;

		switch (type) { // TODO: prio
			case 'gearUp':
				members.forEach(member => { baseline = member.totalGearUp < baseline ? member.totalGearUp : baseline; });
				break;
			case 'accUp':
				members.forEach(member => { baseline = member.totalAccUp < baseline ? member.totalAccUp : baseline; });
				break;
		}

		return baseline;
	}
}

module.exports = Member;
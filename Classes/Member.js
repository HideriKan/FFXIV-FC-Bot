const { EmbedBuilder, GuildMember, PermissionFlagsBits } = require('discord.js');
const fm = require('./FileManager');

class Member {
	// file name constants
	static lootFile = 'MemberLoot.json';
	static csvFile = 'MemberLoot.csv'

	/**
	 * generates an emtpy member with default values
	 * after wards tried to find the member in the file of saved members and gets the data if found
	 * @param {String} id unique discord snowflake id
	 * @param {String} displayName (Optional) name of the user to be used for display information
	 */
	constructor(id, displayName = '') {
		this.displayName = displayName ? displayName : '';
		this.id = id;
		this.priority = 9;
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

		this.fillMemberFromFile()
	}

	/**
	 * saves the member to the json file
	 */
	saveMember() {
		const members = Member.getAllMembers();
		const index = members.findIndex(element => element.id === this.id)
		const updatePrio = index === -1 ? true : members[index].priority === 9 ? true : members[index].priority !== this.priority;

		if (index >= 0)
			members[index] = this;
		else
			members.push(this)

		Member.saveMembers(members, updatePrio);
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
		this.gearDone = member.gearDone;
		this.hasWeapon = member.hasWeapon;
		this.hasBody = member.hasBody;
		this.hasTomeWeap = member.hasTomeWeap;
		this.hasTomeWeapUp = member.hasTomeWeapUp;
		this.totalGearUp = member.totalGearUp;
		this.gearUpDone = member.gearUpDone;
		this.totalAccUp = member.totalAccUp;
		this.accUpDone = member.accUpDone;
	}

	/**
	 * tries to find the user in the file and fill the member with fond one
	 */
	fillMemberFromFile() {
		const fileData = fm.readFile(fm.dir.DATA, Member.lootFile);
		if (fileData === '')
			return

		const jsonData = JSON.parse(fileData);
		const member = jsonData.find(member => member.id === this.id);

		if (member !== undefined)
			this.fromMember(member);
	}

	/**
	 * Generates an discord embed with the data from the users
	 * @param {GuildMember} user the user profile to display
	 * @param {String} type item value
	 * @returns generated embed
	 */
	static toEmbed(user, type) {
		const member = new Member(user.id);
		const embed = new EmbedBuilder()
			.setTitle(user.displayName)
			.setThumbnail(user.displayAvatarURL())
			.setColor(user.displayColor)
			.setFooter({ text: 'work in progress' });

		switch (type) {
			case 'prio':
				embed.setDescription(`Priority: ${member.priority}`);
				break;
			case 'gear':
				embed.setDescription(`Raid gear: ${member.totalGear}, Finished: ${member.gearDone ? 'Yes' : 'No'}`);
				break;
			case 'weap':
				embed.setDescription(`Raid weapon: ${member.hasWeapon ? 'Yes' : 'No'}`);
				break;
			case 'body':
				embed.setDescription(`Raid body: ${member.gearDone ? 'Yes' : 'No'}`);
				break;
			case 'tomeWeap':
				embed.setDescription(`Tome weapon: ${member.hasTomeWeap ? 'Yes' : 'No'}`);
				break;
			case 'tomeUp':
				embed.setDescription(`Tome weapon upgrade: ${member.hasTomeWeapUp ? 'Yes' : 'No'}`);
				break;
			case 'gearUp':
				embed.setDescription(`Gear upgrades: ${member.totalGearUp}, Finished: ${member.gearUpDone ? 'Yes' : 'No'}`);
				break;
			case 'accUp':
				embed.setDescription(`Accessories upgreades: ${member.totalAccUp}, Finished: ${member.accUpDone ? 'Yes' : 'No'}`);
				break;
			case 'user':
			default:
				embed.setDescription(`Priority: ${member.priority}
				Raid gear: ${member.totalGear}, Finished: ${member.gearDone ? 'Yes' : 'No'}
				Raid weapon: ${member.hasWeapon ? 'Yes' : 'No'}
				Raid body: ${member.gearDone ? 'Yes' : 'No'}
				Tome weapon: ${member.hasTomeWeap ? 'Yes' : 'No'}
				Tome weapon upgrade: ${member.hasTomeWeapUp ? 'Yes' : 'No'}
				Gear upgrades: ${member.totalGearUp}, Finished: ${member.gearUpDone ? 'Yes' : 'No'}
				Accessories upgreades: ${member.totalAccUp}, Finished: ${member.accUpDone ? 'Yes' : 'No'}`)
				break;
		}

		return { embeds: [embed] };
	}

	/**
	 * Checks if the given id is already present is in the member json
	 * @returns true if found, otherwise false
	 */
	isMemberInFile() {
		const fileData = fm.readFile(fm.dir.DATA, Member.lootFile);
		if (fileData === '')
			return false;

		const jsonData = JSON.parse(fileData);
		const member = jsonData.find(member => member.id === this.id);

		return member !== undefined;
	}

	/**
	 * will write the passed data into the json
	 * @param {Array} members an Array of Member
	 * @param {Boolean} sortPrio (Optional: defualt false) if true it will sort the members based on priority and move members to fill the gaps
	 */
	static saveMembers(members, sortPrio = false) {
		if (sortPrio) {
			members.sort((a, b) => a.priority - b.priority);

			for (let i = 0; i < members.length; i++)
				members[i].priority = i + 1;
		}

		fm.writeFile(fm.dir.DATA, Member.lootFile, JSON.stringify(members, null, 2));
		Member.backupLastTen();
	}

	/**
	 * acts as an interaction method
	 * wil remove the mentioned member from the file of members
	 * @param {import('discord.js').ButtonInteraction} interaction interactoin from the intercationCreate discord event
	 */
	static async removeMemberFromFile(interaction) {
		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
			interaction.deferReply({ content: 'You do not have the required permissons', ephemeral: true });
			return;
		}

		if (interaction.message.mentions.parsedUsers.size === 0) {
			Member.saveMembers(new Array());
		} else {
			const user = interaction.message.mentions.parsedUsers.first();
			const members = Member.getAllMembers();
			const newMembers = members.filter(member => member.id !== user.id);

			Member.saveMembers(newMembers);
		}

		interaction.update({ content: interaction.message.content.replace('Remove', 'Removed').replace('?', ''), components: [] });
	}

	static async resetMemberFromFile(interaction) {
		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
			interaction.deferReply({ content: 'You do not have the required permissons', ephemeral: true });
			return;
		}

		if (interaction.message.mentions.parsedUsers.size === 0) {
			const members = Member.getAllMembers();
			members.forEach(member => { member = Member(member.id, member.displayName) });
			Member.saveMembers(members);
		} else {
			const user = interaction.message.mentions.parsedUsers.first();
			const members = Member.getAllMembers();
			const memberIndex = members.findIndex(member => member.id === user.id);

			members[memberIndex] = new Member(members[memberIndex].id, members[memberIndex].displayName);

			Member.saveMembers(newMembers);
		}

		interaction.update({ content: interaction.message.content.replace('Reset', 'Reseted').replace('?', ''), components: [] });
	}

	/**
	 * reads the json file and returns the found members
	 * @returns {Array} array of members
	 */
	static getAllMembers() {
		const fileData = fm.readFile(fm.dir.DATA, Member.lootFile);
		if (fileData === '')
			return new Array;

		return JSON.parse(fileData);
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

		switch (type) {
			case 'gearUp':
				members.forEach(member => { if (!member.gearUpDone) baseline = member.totalGearUp < baseline ? member.totalGearUp : baseline; });
				break;
			case 'accUp':
				members.forEach(member => { if (!member.accUpDone) baseline = member.totalAccUp < baseline ? member.totalAccUp : baseline; });
				break;
		}

		return baseline;
	}

	/**
	 * checks the amount of files in the given backup location and if its over 10 it will remove one
	 * then save another csv file as backup
	 */
	static backupLastTen() {
		const csvFiles = fm.readDir(fm.dir.BKUP).filter(file => file.endsWith(Member.csvFile));
		csvFiles.reverse();

		while (csvFiles.length >= 10)
			fm.removeFile(fm.dir.BKUP, csvFiles.pop());

		const content = Member.toCSVFile();
		const file = new Date().getTime() + Member.csvFile;
		fm.writeFile(fm.dir.BKUP, file, content);
	}

	/**
	 * generates the content for a csv file
	 * @returns {String} csv content
	 */
	static toCSVFile() {
		const members = Member.getAllMembers();

		let content = 'Name, Id, Priority, Total gear, Gear done, Weapon, Body, Tome weapon, Tome weapon upgrade, Gear upgrade, Gear upgrade done, Accessory upgrade, Accessory upgrade done\n';
		members.forEach(member => {
			content += `${member.displayName}, ${member.id}, ${member.priority}, ${member.totalGear}, ${member.gearDone ? '1' : '0'}, ${member.hasTomeWeap ? '1' : '0'}, ${member.hasBody ? '1' : '0'}, ${member.hasTomeWeap ? '1' : '0'}, ${member.hasTomeWeapUp ? '1' : '0'}, ${member.totalGearUp}, ${member.gearUpDone ? '1' : '0'}, ${member.totalAccUp}, ${member.accUpDone ? '1' : '0'}\n`;
		});

		return content;
	}
}

module.exports = Member;
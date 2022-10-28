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
			const member = data.find(member => member.id === this.id );

			if (member !== undefined)
				this.fromMember(member);

		} catch (err) {
			onFileError(error)
		}
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
}

module.exports = Member;
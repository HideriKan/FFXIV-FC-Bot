const fs = require('fs');
const { fileExists } = require('../utility');

class Member {
	static fileName = './MemberLoot.json';

	constructor(name, id) {
		

		if (Member.isInFile(id))
			this.fromMember(this.findInFile(id));
		else {
			this.name = name; // display name
			this.id = id; // unique discord snowflake id
			this.hasBiS = false; // might not use
			this.priority = 0;
			this.totalGear = 0;
			this.hasWeapon = false;
			this.hasBody = false;
			this.hasTomeWeap = false;
			this.hasTomeWeapUp = false;
			this.TotalGearUp = 0;
			this.TotalAccUp = 0;
		}
	}

	/**
	 * finds and fills the corresponding user in the file
	 * @param {String} id unique discord snowflake id
	 */
	static findInFile(id) {
		if (fileExists(this.fileName)) {
			const data = JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
			// TODO: test
			const member = data.find(member => { member.id === id });

			if (member !== undefined)
				return member;
		}

		return new Member();
	}

	/**
	 * saves the member to the json file
	 */
	saveMember() {
		const members = getAllMembers();

		if (isMemberAlreadyPresent(this.id)) {
			for (let i = 0; i < members.length; i++)
				if (members[i].id == this.id)
					members[i] = this;

		}
		else
			members.push(this)

		saveMembers(members);
	}

	/**
	 * 
	 * @param {Member} member 
	 */
	fromMember(member) {
		this.name = member.name; // display name
		this.id = member.id; // unique discord snowflake id
		this.hasBiS = member.hasBiS; // might not use
		this.priority = member.priority;
		this.totalGear = member.totalGear;
		this.hasWeapon = member.hasWeapon;
		this.hasBody = member.hasBody;
		this.hasTomeWeap = member.hasTomeWeap;
		this.hasTomeWeapUp = member.hasTomeWeapUp;
		this.TotalGearUp = member.TotalGearUp;
		this.TotalAccUp = member.TotalAccUp;
	}

	/**
	 * Checks if the given id is already present is in the member json
	 * @param {String} id unqie discord snowflake id
	 * @returns true if found, otherwise false
	 */
	static isInFile(id) {
		if (fileExists(this.fileName)) {
			const data = JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
			const member = data.find(member => { member.id === id });

			return member !== undefined;
		}

		return false;
	}

	/**
	 * will write the passed data into the json
	 * @param {Array} data an Array of Member
	 */
	static saveMembers(data) {
		try {
			fs.writeFileSync(this.fileName, JSON.stringify(data, null, 2));
		} catch (err) {
			if (err) return console.error(err);
		}
	}

	/**
	 * reads the json file and returns the found members
	 * @returns {Array} array of members
	 */
	static getAllMembers() {
		if (fileExists(this.fileName)) {
			try {
				const data = JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
				// TODO: test on empty file
				return data
			} catch (error) {
				console.error(err);
			}
		}
		return new Array;
	}
}

module.exports = Member;
const fs = require('fs');

class Member {
	static fileName = './MemberLoot.json';

	constructor(name, id) {
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

	/**
	 * finds and fills the corresponding user in the file
	 * @param {String} id unique discord snowflake id
	 */
	findInFile(id) {
		const data = JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
		// TODO: test
		const member = data.find(member => { member.id === id });

		if (member !== undefined) {
			this = member;
		}
	}

	/**
	 * saves the member
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
	 * Checks if the given id is already present is in the member json
	 * @param {String} id unqie discord snowflake id
	 * @returns true if found, otherwise false
	 */
	static isMemberAlreadyPresent(id) {
		const data = JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
		const member = data.find(member => { member.id === id });
		
		return member !== undefined;
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
		try {
			const data = JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
			// TODO: test on empty file
			return data
		} catch (error) {
			console.error(err);
			return new Array;
		}
	}
}

module.exports = Member;
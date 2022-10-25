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
		this.hasTimeWeapUp = false;
		this.TotalGearUp = 0;
		this.TotalAccUp = 0;
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
			return JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
		} catch (error) {
			console.error(err);
			return new Array;
		}
	}
}

module.exports = Member;
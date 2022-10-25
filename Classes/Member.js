class Member {
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

	}
}

module.exports = Member;
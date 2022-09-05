/**
 * Returns the day of the reset in FFXIV (Tuesday)
 * @returns True current week Date (of Tuesday)
 */
function getStartingDay(isNextWeek = false) { // ++ or --
	const direction = isNextWeek ? 1 : -1;
	const now = new Date(Date.now());

	while (now.getUTCDay() != 2) { // 2 is Thuesday
		now.setUTCDate(now.getUTCDate() + direction);
	}

	return now;
} // End of getStartingDay

module.exports = getStartingDay ;
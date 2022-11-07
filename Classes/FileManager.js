const fs = require('fs');
const path = require('path');

class FileManager {
	constructor() { }
	static dir = {
		DATA: './data',
		BKUP: './data/backup',
	}

	static readFile(dataLocation, fileName) {
		const filePath = path.join(dataLocation, fileName);
		FileManager.ensureFileExists(filePath);

		try {
			return fs.readFileSync(filePath, 'utf8')
		} catch (err) {
			console.error(err);
			return '';
		}
	}

	static writeFile(dataLocation, fileName, data) {
		const filePath = path.join(dataLocation, fileName);

		try {
			fs.writeFileSync(filePath, data);
		} catch (err) {
			console.error(err);
		}
	}

	static removeFile(fileName) {
		FileManager.ensureFileExists(fileName);

		try {
			fs.unlinkSync(fileName);
		} catch (err) {
			console.error(err);
		}
	}

	static readDir(directory) {
		FileManager.ensureDirExists(directory);

		try {
			return fs.readdirSync(directory);
		} catch (err) {
			console.error(err);
			return new Array;
		}
	}

	static ensureFileExists(fileName) {
		FileManager.ensureDirExists(path.dirname(fileName));

		try {
			fs.writeFileSync(fileName, '', { flag: 'wx' });
		} catch (err) {
			if (err.code !== 'EEXIST')
				console.error('ensureFileExists: ' + err);
		}
	}

	static ensureDirExists(directory) {
		try {
			fs.mkdirSync(directory, { recursive: true });
		} catch (err) {
			if (err)
				console.error('ensureDirExists: ' + err);
		}
	}

}

module.exports = FileManager;
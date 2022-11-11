const fs = require('fs');
const path = require('path');

/**
 * Host class for file operations
 */
class FileManager {
	constructor() { }
	static dir = {
		DATA: './data',
		BKUP: './data/backup',
	}

	/**
	 * Reads the data from a file and returns the data
	 * @param {String} dataLocation directory to search the file in
	 * @param {String} fileName name of the file to be read
	 * @returns data from the read file
	 */
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

	/**
	 * Writes the given data into the file
	 * @param {String} dataLocation directory to search the file in
	 * @param {String} fileName name of the file to be read
	 * @param {*} data to write into the file
	 */
	static writeFile(dataLocation, fileName, data) {
		const filePath = path.join(dataLocation, fileName);

		try {
			fs.writeFileSync(filePath, data);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * deletes a file from the filesystem
	 * @param {String} fileName name of the file to be read
	 */
	static removeFile(fileName) { // TODO: test if dataLoc is needed or not
		FileManager.ensureFileExists(fileName);

		try {
			fs.unlinkSync(fileName);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * reads all the file name in the given directory
	 * @param {String} directory which directory to read the files
	 * @returns 
	 */
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
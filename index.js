'use strict';

const {dirname, resolve} = require('path');
const {stat} = require('fs').promises;
const {promisify} = require('util');

const inspectWithKind = require('inspect-with-kind');
const mkdirp = require('mkdirp');

const PATH_ERROR = 'Expected a file path (<string>)';
const promisifiedMkdirp = promisify(mkdirp);

module.exports = async function prepareWrite(...args) {
	const argLen = args.length;

	if (argLen !== 1) {
		throw new RangeError(`Expected 1 argument (<string>), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments instead.`);
	}

	const [filePath] = args;

	if (typeof filePath !== 'string') {
		throw new TypeError(`${PATH_ERROR}, but got ${inspectWithKind(filePath)}.`);
	}

	if (filePath.length === 0) {
		throw new Error(`${PATH_ERROR}, but got '' (empty string).`);
	}

	const absoluteFilePath = resolve(filePath);

	return (await Promise.all([
		promisifiedMkdirp(dirname(absoluteFilePath)),
		(async () => {
			try {
				if (!(await stat(absoluteFilePath)).isDirectory()) {
					return;
				}
			} catch {
				return;
			}

			const error = new Error(`Tried to create a file as ${
				absoluteFilePath
			}, but a directory with the same name already exists.`);

			error.code = 'EISDIR';
			error.path = absoluteFilePath;
			error.syscall = 'open';

			throw error;
		})()
	]))[0];
};

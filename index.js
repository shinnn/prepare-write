'use strict';

const {dirname, resolve} = require('path');
const {mkdir, stat} = require('fs').promises;

const inspectWithKind = require('inspect-with-kind');

const PATH_ERROR = 'Expected a file path (<string>)';

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

	await Promise.all([
		mkdir(dirname(absoluteFilePath), {recursive: true}),
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
	]);
};

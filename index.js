'use strict';

const {dirname, resolve: resolvePath} = require('path');

const fs = require('graceful-fs');
const inspectWithKind = require('inspect-with-kind');
const isDir = require('is-dir');
const mkdirp = require('mkdirp');

const PATH_ERROR = 'Expected a file path (string)';

module.exports = function prepareWrite(...args) {
	const argLen = args.length;

	if (argLen !== 1) {
		return Promise.reject(new RangeError(`Expected 1 argument (string), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments instead.`));
	}

	const [filePath] = args;

	if (typeof filePath !== 'string') {
		return Promise.reject(new TypeError(`${PATH_ERROR}, but got ${inspectWithKind(filePath)}.`));
	}

	if (filePath.length === 0) {
		return Promise.reject(new Error(`${PATH_ERROR}, but got '' (empty string).`));
	}

	const absoluteFilePath = resolvePath(filePath);

	return Promise.all([
		new Promise((resolve, reject) => {
			mkdirp(dirname(absoluteFilePath), {fs}, (err, firstDir) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(firstDir);
			});
		}),
		new Promise((resolve, reject) => {
			isDir(filePath, (err, yes) => {
				if (err) {
					resolve();
					return;
				}

				if (yes) {
					const error = new Error(`Tried to create a file as ${
						absoluteFilePath
					}, but a directory with the same name already exists.`);
					error.code = 'EISDIR';
					error.path = absoluteFilePath;
					error.syscall = 'open';
					reject(error);

					return;
				}

				resolve();
			});
		})
	]).then(result => result[0]);
};

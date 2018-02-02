'use strict';

const {lstat} = require('fs');
const {promisify} = require('util');
const {resolve} = require('path');

const prepareWrite = require('.');
const rmfr = require('rmfr');
const test = require('tape');

const promisifiedLstat = promisify(lstat);

test('prepareWrite()', async t => {
	t.plan(13);

	await rmfr('tmp');

	(async () => {
		const dir = await prepareWrite('tmp/0/1');

		t.ok(
			(await promisifiedLstat('tmp/0')).isDirectory(),
			'should create a parent directory of the file.'
		);

		t.ok(
			(await promisifiedLstat('tmp')).isDirectory(),
			'should create ancestor directories of the file.'
		);

		t.equal(
			dir,
			resolve('tmp'),
			'should be resolved with the path of the first created directory.'
		);
	})().catch(t.fail);

	(async () => {
		t.equal(
			await prepareWrite(__filename),
			null,
			'should be resolved with null when it creates no directories.'
		);
	})().catch(t.fail);

	(async () => {
		try {
			await prepareWrite(resolve('index.js', 'foo'));
		} catch ({code}) {
			t.equal(code, 'EEXIST', 'should fail when it cannot create directories.');
		}
	})().catch(t.fail);

	(async () => {
		try {
			await prepareWrite(__dirname);
		} catch (err) {
			t.equal(
				err.toString(),
				`Error: Tried to create a file as ${
					__dirname
				}, but a directory with the same name already exists.`,
				'should fail when a diretory already exists in the target path.'
			);

			t.equal(err.code, 'EISDIR', 'should add an appropriate `code` property to the error.');
			t.equal(err.path, __dirname, 'should add an appropriate `path` property to the error.');
			t.equal(err.syscall, 'open', 'should add an appropriate `syscall` property to the error.');
		}
	})().catch(t.fail);

	(async () => {
		try {
			await prepareWrite(/^/);
		} catch (err) {
			t.equal(
				err.toString(),
				'TypeError: Expected a file path (string), but got /^/ (regexp).',
				'should fail when it takes a non-string argument.'
			);
		}
	})().catch(t.fail);

	try {
		await prepareWrite('');
	} catch (err) {
		t.equal(
			err.toString(),
			'Error: Expected a file path (string), but got \'\' (empty string).',
			'should fail when it takes an empty string.'
		);
	}

	try {
		await prepareWrite();
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 1 argument (string), but got no arguments instead.',
			'should fail when it takes no arguments.'
		);
	}

	try {
		await prepareWrite('a', 'b');
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 1 argument (string), but got 2 arguments instead.',
			'should fail when it takes too many arguments.'
		);
	}
});

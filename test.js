'use strict';

const {resolve} = require('path');

const lstat = require('lstat');
const prepareWrite = require('.');
const rmfr = require('rmfr');
const test = require('tape');

test('prepareWrite()', async t => {
  t.plan(11);

  await rmfr('tmp');

  prepareWrite('tmp/0/1').then(async dir => {
    t.ok(
      (await lstat('tmp/0')).isDirectory(),
      'should create a parent directory of the file.'
    );

    t.ok(
      (await lstat('tmp')).isDirectory(),
      'should create ancestor directories of the file.'
    );

    t.equal(
      dir,
      resolve('tmp'),
      'should be resolved with the path of the first created directory.'
    );
  }).catch(t.fail);

  prepareWrite(__filename).then(dir => {
    t.equal(dir, null, 'should be resolved with null when it creates no directories.');
  }).catch(t.fail);

  prepareWrite(resolve('index.js', 'foo')).catch(({code}) => {
    t.equal(code, 'EEXIST', 'should fail when it cannot create directories.');
  }).catch(t.fail);

  prepareWrite(__dirname).catch(err => {
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
  }).catch(t.fail);

  prepareWrite(/^/).catch(err => {
    t.equal(
      err.toString(),
      'TypeError: Expected a file path (string), but got /^/ (regexp).',
      'should fail when it takes a non-string argument.'
    );
  }).catch(t.fail);

  prepareWrite('').catch(err => {
    t.equal(
      err.toString(),
      'Error: Expected a file path (string), but got \'\' (empty string).',
      'should fail when it takes an empty string.'
    );
  }).catch(t.fail);
});

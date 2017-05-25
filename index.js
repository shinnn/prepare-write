'use strict';

var inspect = require('util').inspect;
var pathLib = require('path');

var dirname = pathLib.dirname;
var resolvePath = pathLib.resolve;

var fs = require('graceful-fs');
var isDir = require('is-dir');
var mkdirp = require('mkdirp');
var PinkiePromise = require('pinkie-promise');

var PATH_ERROR = 'Expected a file path (string)';

module.exports = function prepareWrite(filePath) {
  if (typeof filePath !== 'string') {
    return PinkiePromise.reject(new TypeError(PATH_ERROR + ', but got ' + inspect(filePath) + '.'));
  }

  if (filePath.length === 0) {
    return PinkiePromise.reject(new Error(PATH_ERROR + ', but got \'\' (empty string).'));
  }

  var absoluteFilePath = resolvePath(filePath);

  return PinkiePromise.all([
    new PinkiePromise(function(resolve, reject) {
      mkdirp(dirname(absoluteFilePath), {fs: fs}, function(err, firstDir) {
        if (err) {
          reject(err);
          return;
        }

        resolve(firstDir);
      });
    }),
    new PinkiePromise(function(resolve, reject) {
      isDir(filePath, function(err, yes) {
        if (err) {
          resolve();
          return;
        }

        if (yes) {
          var error = new Error(
            'Tried to create a file as ' +
            absoluteFilePath +
            ', but a directory with the same name already exists.'
          );
          error.code = 'EISDIR';
          error.path = absoluteFilePath;
          error.syscall = 'open';
          reject(error);

          return;
        }

        resolve();
      });
    })
  ]).then(function(results) {
    return results[0];
  });
};

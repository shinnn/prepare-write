'use strict';

var inspect = require('util').inspect;
var pathLib = require('path');

var dirname = pathLib.dirname;
var resolvePath = pathLib.resolve;

var fs = require('graceful-fs');
var isDir = require('is-dir');
var mkdirp = require('mkdirp');

var PATH_ERROR = 'Expected a file path (string)';

module.exports = function prepareWrite(filePath) {
  if (typeof filePath !== 'string') {
    return Promise.reject(new TypeError(PATH_ERROR + ', but got ' + inspect(filePath) + '.'));
  }

  if (filePath.length === 0) {
    return Promise.reject(new Error(PATH_ERROR + ', but got \'\' (empty string).'));
  }

  var absoluteFilePath = resolvePath(filePath);

  return Promise.all([
    new Promise(function(resolve, reject) {
      mkdirp(dirname(absoluteFilePath), {fs: fs}, function(err, firstDir) {
        if (err) {
          reject(err);
          return;
        }

        resolve(firstDir);
      });
    }),
    new Promise(function(resolve, reject) {
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

# prepare-write

[![npm version](https://img.shields.io/npm/v/prepare-write.svg)](https://www.npmjs.com/package/prepare-write)
[![Build Status](https://travis-ci.com/shinnn/prepare-write.svg?branch=master)](https://travis-ci.com/shinnn/prepare-write)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/prepare-write.svg)](https://coveralls.io/github/shinnn/prepare-write?branch=master)

Prepare for writing a file to the given path – create ancestor directories and verify no directory exists in the path

```javascript
const {existsSync} = require('fs');
const prepareWrite = require('prepare-write');

(async () => {
  existsSync('dir0'); //=> false

  await prepareWrite('dir0/dir1/dir2/file.txt');

  existsSync('dir0'); //=> true
  existsSync('dir0/dir1'); //=> true
  existsSync('dir0/dir1/dir2'); //=> true
  existsSync('dir0/dir1dir2/file.txt'); //=> false
})();
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/).

```
npm install prepare-write
```

## API

```javascript
const prepareWrite = require('prepare-write');
```

### prepareWrite(*path*)

*path*: `string` (directory path)  
Return: `Promise<string | null>`

It ensures you can soon write a file to the given path by:

1. Creating ancestor directories if they don't exist
2. Checking if no directory already exists in the path

```javascript
(async () => {
  // a directory /foo doesn't exist

  await prepareWrite('/foo/bar/baz');

  // a directory /foo/bar now exists

  await prepareWrite('/foo/bar');
  // Error: Tried to create a file as /foo/bar, but a directory with the same name already exists.
})();
```

## License

[ISC License](./LICENSE) © 2017 - 2019 Watanabe Shinnosuke
